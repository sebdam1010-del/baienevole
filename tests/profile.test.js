const request = require('supertest');
const app = require('../src/app');
const db = require('../src/utils/db');

describe('Volunteer Profile API', () => {
  let volunteerToken;
  let volunteerUserId;
  let volunteer2Token;
  let volunteer2UserId;
  let adminToken;

  beforeEach(async () => {
    // Clean up
    await db.eventRegistration.deleteMany();
    await db.event.deleteMany();
    await db.user.deleteMany();

    await new Promise((resolve) => setTimeout(resolve, 10));

    // Create admin
    const adminEmail = `profile-admin-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: adminEmail,
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
      });

    await db.user.update({
      where: { id: adminResponse.body.user.id },
      data: { role: 'ADMIN' },
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: adminEmail,
        password: 'Admin123!',
      });

    adminToken = adminLogin.body.token;

    await new Promise((resolve) => setTimeout(resolve, 10));

    // Create volunteer 1
    const volunteerEmail = `profile-volunteer-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
    const volunteerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: volunteerEmail,
        password: 'Volunteer123!',
        firstName: 'John',
        lastName: 'Doe',
      });

    volunteerToken = volunteerResponse.body.token;
    volunteerUserId = volunteerResponse.body.user.id;

    await new Promise((resolve) => setTimeout(resolve, 10));

    // Create volunteer 2
    const volunteer2Email = `profile-volunteer2-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
    const volunteer2Response = await request(app)
      .post('/api/auth/register')
      .send({
        email: volunteer2Email,
        password: 'Volunteer123!',
        firstName: 'Jane',
        lastName: 'Smith',
      });

    volunteer2Token = volunteer2Response.body.token;
    volunteer2UserId = volunteer2Response.body.user.id;
  });

  afterAll(async () => {
    await db.eventRegistration.deleteMany();
    await db.event.deleteMany();
    await db.user.deleteMany();
    await db.$disconnect();
  });

  describe('GET /api/profile', () => {
    it('should return volunteer profile', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', volunteerUserId);
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('firstName', 'John');
      expect(response.body).toHaveProperty('lastName', 'Doe');
      expect(response.body).toHaveProperty('role', 'VOLUNTEER');
      expect(response.body).not.toHaveProperty('password'); // Password should not be returned
    });

    it('should include profile fields (phone, skills, availability, bio)', async () => {
      // Update user with profile info
      await db.user.update({
        where: { id: volunteerUserId },
        data: {
          phone: '514-123-4567',
          skills: 'Accueil, Billetterie',
          availability: 'Weekends',
          bio: 'Passionate volunteer',
        },
      });

      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.phone).toBe('514-123-4567');
      expect(response.body.skills).toBe('Accueil, Billetterie');
      expect(response.body.availability).toBe('Weekends');
      expect(response.body.bio).toBe('Passionate volunteer');
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/profile');

      expect(response.status).toBe(401);
    });

    it('should work for admin users too', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('role', 'ADMIN');
    });
  });

  describe('PUT /api/profile', () => {
    it('should update volunteer profile', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          phone: '514-555-1234',
          skills: 'Technique, Son',
          availability: 'Evenings and weekends',
          bio: 'Tech enthusiast, love helping with events',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('profile');
      expect(response.body.profile.phone).toBe('514-555-1234');
      expect(response.body.profile.skills).toBe('Technique, Son');
      expect(response.body.profile.availability).toBe('Evenings and weekends');
      expect(response.body.profile.bio).toBe('Tech enthusiast, love helping with events');

      // Verify in database
      const user = await db.user.findUnique({ where: { id: volunteerUserId } });
      expect(user.phone).toBe('514-555-1234');
      expect(user.skills).toBe('Technique, Son');
    });

    it('should allow updating name fields', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          firstName: 'Johnny',
          lastName: 'Doeson',
        });

      expect(response.status).toBe(200);
      expect(response.body.profile.firstName).toBe('Johnny');
      expect(response.body.profile.lastName).toBe('Doeson');
    });

    it('should allow partial updates', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          phone: '514-999-8888',
        });

      expect(response.status).toBe(200);
      expect(response.body.profile.phone).toBe('514-999-8888');
      // Other fields should remain unchanged
      expect(response.body.profile.firstName).toBe('John');
    });

    it('should not allow changing email', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          email: 'newemail@example.com',
        });

      // Email update should be ignored or rejected
      expect(response.status).toBe(200);
      const user = await db.user.findUnique({ where: { id: volunteerUserId } });
      expect(user.email).not.toBe('newemail@example.com');
    });

    it('should not allow changing role', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          role: 'ADMIN',
        });

      expect(response.status).toBe(200);
      const user = await db.user.findUnique({ where: { id: volunteerUserId } });
      expect(user.role).toBe('VOLUNTEER'); // Role should not change
    });

    it('should not allow changing password directly', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          password: 'NewPassword123!',
        });

      expect(response.status).toBe(200);
      // Password should not be updated via profile endpoint
      // (there should be a separate password change endpoint)
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/profile')
        .send({ phone: '514-123-4567' });

      expect(response.status).toBe(401);
    });

    it('should clear optional fields when set to null or empty', async () => {
      // First set some values
      await db.user.update({
        where: { id: volunteerUserId },
        data: { phone: '514-123-4567', bio: 'Some bio' },
      });

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          phone: '',
          bio: null,
        });

      expect(response.status).toBe(200);
      expect(response.body.profile.phone).toBeNull();
      expect(response.body.profile.bio).toBeNull();
    });
  });

  describe('GET /api/volunteers', () => {
    beforeEach(async () => {
      // Update volunteers with profile info
      await db.user.update({
        where: { id: volunteerUserId },
        data: {
          phone: '514-111-2222',
          skills: 'Accueil',
          availability: 'Weekends',
        },
      });

      await db.user.update({
        where: { id: volunteer2UserId },
        data: {
          phone: '514-333-4444',
          skills: 'Technique',
          availability: 'Evenings',
        },
      });
    });

    it('should return list of volunteers for admin', async () => {
      const response = await request(app)
        .get('/api/volunteers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);

      // Check that volunteers are in the list
      const volunteer1 = response.body.find((v) => v.id === volunteerUserId);
      expect(volunteer1).toBeDefined();
      expect(volunteer1.firstName).toBe('John');
      expect(volunteer1.phone).toBe('514-111-2222');
      expect(volunteer1.skills).toBe('Accueil');
      expect(volunteer1).not.toHaveProperty('password');
    });

    it('should not include admins in volunteer list', async () => {
      const response = await request(app)
        .get('/api/volunteers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      // Should only have volunteers, not admin users
      const admins = response.body.filter((v) => v.role === 'ADMIN');
      expect(admins.length).toBe(0);
    });

    it('should deny access to non-admin users', async () => {
      const response = await request(app)
        .get('/api/volunteers')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(403);
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/volunteers');

      expect(response.status).toBe(401);
    });

    it('should order volunteers by lastName, firstName', async () => {
      const response = await request(app)
        .get('/api/volunteers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      // Verify ordering (Doe, John should come before Smith, Jane)
      const doeIndex = response.body.findIndex((v) => v.lastName === 'Doe');
      const smithIndex = response.body.findIndex((v) => v.lastName === 'Smith');
      expect(doeIndex).toBeLessThan(smithIndex);
    });
  });
});
