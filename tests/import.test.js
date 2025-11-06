const request = require('supertest');
const app = require('../src/app');
const db = require('../src/utils/db');
const path = require('path');
const fs = require('fs').promises;

describe('CSV Import API', () => {
  let adminToken;
  let volunteerToken;
  const tmpDir = path.join(__dirname, 'tmp');

  beforeAll(async () => {
    // Create tmp directory for test CSV files
    try {
      await fs.mkdir(tmpDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  });

  beforeEach(async () => {
    // Clean up events and users before each test
    await db.event.deleteMany();
    await db.user.deleteMany();

    // Wait a bit to ensure clean state
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Create admin user with unique email
    const adminEmail = `import-admin-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: adminEmail,
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
      });

    // Ensure registration was successful
    if (!adminResponse.body.user) {
      throw new Error(`Admin registration failed: ${JSON.stringify(adminResponse.body)}`);
    }

    await db.user.update({
      where: { id: adminResponse.body.user.id },
      data: { role: 'ADMIN' },
    });

    // Wait a moment for database update to complete
    await new Promise((resolve) => setTimeout(resolve, 10));

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: adminEmail,
        password: 'Admin123!',
      });

    // Ensure login was successful
    if (!adminLogin.body.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.body)}`);
    }

    adminToken = adminLogin.body.token;

    // Wait a bit to ensure unique timestamps
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Create volunteer user with unique email
    const volunteerEmail = `import-volunteer-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
    const volunteerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: volunteerEmail,
        password: 'Volunteer123!',
        firstName: 'Volunteer',
        lastName: 'User',
      });

    volunteerToken = volunteerResponse.body.token;
  });

  afterAll(async () => {
    // Clean up
    await db.event.deleteMany();
    await db.user.deleteMany();
    await db.$disconnect();

    // Remove tmp directory
    try {
      const files = await fs.readdir(tmpDir);
      for (const file of files) {
        await fs.unlink(path.join(tmpDir, file));
      }
      await fs.rmdir(tmpDir);
    } catch (error) {
      // Directory might not exist or might already be empty
    }
  });

  describe('POST /api/events/import', () => {
    it('should import valid CSV file with admin token', async () => {
      // Create a valid CSV file
      const csvContent = `date,nom,description,horaireArrivee,horaireDepart,nombreSpectatursAttendus,nombreBenevolesRequis,saison,commentaires
2024-06-15,Spectacle A,Description A,14:00,17:30,150,5,29,Commentaire A
2024-07-20,Spectacle B,Description B,18:00,22:00,200,8,29,Commentaire B`;

      const csvPath = path.join(tmpDir, 'valid-events.csv');
      await fs.writeFile(csvPath, csvContent);

      const response = await request(app)
        .post('/api/events/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', csvPath);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('imported');
      expect(response.body.imported).toBe(2);
      expect(response.body).toHaveProperty('events');
      expect(response.body.events).toHaveLength(2);

      // Verify events were created in database
      const events = await db.event.findMany();
      expect(events).toHaveLength(2);
      expect(events[0].nom).toBe('Spectacle A');
      expect(events[1].nom).toBe('Spectacle B');
    });

    it('should deny import without authentication', async () => {
      const csvContent = `date,nom,description,horaireArrivee,horaireDepart,nombreSpectatursAttendus,nombreBenevolesRequis,saison,commentaires
2024-06-15,Test,Test desc,14:00,17:30,100,5,29,Test`;

      const csvPath = path.join(tmpDir, 'test-noauth.csv');
      await fs.writeFile(csvPath, csvContent);

      const response = await request(app)
        .post('/api/events/import')
        .attach('file', csvPath);

      expect(response.status).toBe(401);
    });

    it('should deny import for non-admin users', async () => {
      const csvContent = `date,nom,description,horaireArrivee,horaireDepart,nombreSpectatursAttendus,nombreBenevolesRequis,saison,commentaires
2024-06-15,Test,Test desc,14:00,17:30,100,5,29,Test`;

      const csvPath = path.join(tmpDir, 'test-volunteer.csv');
      await fs.writeFile(csvPath, csvContent);

      const response = await request(app)
        .post('/api/events/import')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .attach('file', csvPath);

      expect(response.status).toBe(403);
    });

    it('should reject CSV with invalid date format', async () => {
      const csvContent = `date,nom,description,horaireArrivee,horaireDepart,nombreSpectatursAttendus,nombreBenevolesRequis,saison,commentaires
15/06/2024,Test,Test desc,14:00,17:30,100,5,29,Test`;

      const csvPath = path.join(tmpDir, 'invalid-date.csv');
      await fs.writeFile(csvPath, csvContent);

      const response = await request(app)
        .post('/api/events/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', csvPath);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors[0].errors).toContain('Invalid date format. Use YYYY-MM-DD');
    });

    it('should reject CSV with invalid time format', async () => {
      const csvContent = `date,nom,description,horaireArrivee,horaireDepart,nombreSpectatursAttendus,nombreBenevolesRequis,saison,commentaires
2024-06-15,Test,Test desc,2:00 PM,5:30 PM,100,5,29,Test`;

      const csvPath = path.join(tmpDir, 'invalid-time.csv');
      await fs.writeFile(csvPath, csvContent);

      const response = await request(app)
        .post('/api/events/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', csvPath);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('errors');
      const errorMessages = response.body.errors[0].errors.join(' ');
      expect(errorMessages).toMatch(/time format/i);
    });

    it('should reject CSV with missing required fields', async () => {
      const csvContent = `date,nom,description
2024-06-15,Test,Test desc`;

      const csvPath = path.join(tmpDir, 'missing-fields.csv');
      await fs.writeFile(csvPath, csvContent);

      const response = await request(app)
        .post('/api/events/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', csvPath);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject request without file', async () => {
      const response = await request(app)
        .post('/api/events/import')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('file');
    });

    it('should handle empty CSV file', async () => {
      const csvContent = `date,nom,description,horaireArrivee,horaireDepart,nombreSpectatursAttendus,nombreBenevolesRequis,saison,commentaires`;

      const csvPath = path.join(tmpDir, 'empty.csv');
      await fs.writeFile(csvPath, csvContent);

      const response = await request(app)
        .post('/api/events/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', csvPath);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('empty');
    });

    it('should provide detailed error report for multiple invalid rows', async () => {
      const csvContent = `date,nom,description,horaireArrivee,horaireDepart,nombreSpectatursAttendus,nombreBenevolesRequis,saison,commentaires
invalid-date,Test 1,Desc,14:00,17:30,100,5,29,Comment
2024-06-15,Test 2,Desc,25:00,17:30,100,5,29,Comment
2024-07-20,Test 3,Desc,14:00,17:30,-100,5,29,Comment`;

      const csvPath = path.join(tmpDir, 'multiple-errors.csv');
      await fs.writeFile(csvPath, csvContent);

      const response = await request(app)
        .post('/api/events/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', csvPath);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should import events with optional fields missing', async () => {
      const csvContent = `date,nom,description,horaireArrivee,horaireDepart,nombreSpectatursAttendus,nombreBenevolesRequis,saison,commentaires
2024-06-15,Spectacle A,,14:00,17:30,,5,29,
2024-07-20,Spectacle B,With description,18:00,22:00,200,8,29,With comment`;

      const csvPath = path.join(tmpDir, 'optional-fields.csv');
      await fs.writeFile(csvPath, csvContent);

      const response = await request(app)
        .post('/api/events/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', csvPath);

      expect(response.status).toBe(200);
      expect(response.body.imported).toBe(2);

      // Verify events were created with correct handling of optional fields
      const events = await db.event.findMany({ orderBy: { date: 'asc' } });
      expect(events[0].description).toBeNull();
      expect(events[0].nombreSpectatursAttendus).toBe(0);
      expect(events[0].commentaires).toBeNull();
      expect(events[1].description).toBe('With description');
      expect(events[1].commentaires).toBe('With comment');
    });
  });
});
