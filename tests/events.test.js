const request = require('supertest');
const app = require('../src/app');
const db = require('../src/utils/db');

describe('Events API (CRUD)', () => {
  let adminToken;
  let volunteerToken;

  beforeEach(async () => {
    // Clean up events and users before each test
    await db.event.deleteMany();
    await db.user.deleteMany();

    // Wait a bit to ensure unique timestamps
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Create admin user with unique email for events tests
    const adminEmail = `events-admin-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
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
    const volunteerEmail = `events-volunteer-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
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
    await db.event.deleteMany();
    await db.user.deleteMany();
    await db.$disconnect();
  });

  describe('POST /api/events', () => {
    const validEvent = {
      date: '2024-06-15',
      nom: 'Spectacle de marionnettes',
      description: 'Spectacle pour enfants',
      horaireArrivee: '14:00',
      horaireDepart: '17:30',
      nombreSpectatursAttendus: 150,
      nombreBenevolesRequis: 5,
      saison: 29,
      commentaires: 'Prévoir chaises supplémentaires',
    };

    it('should create an event with admin token', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validEvent);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.nom).toBe(validEvent.nom);
      expect(response.body.saison).toBe(validEvent.saison);
    });

    it('should deny event creation for volunteers', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send(validEvent);

      expect(response.status).toBe(403);
    });

    it('should deny event creation without token', async () => {
      const response = await request(app)
        .post('/api/events')
        .send(validEvent);

      expect(response.status).toBe(401);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nom: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if date format is invalid', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validEvent, date: 'invalid-date' });

      expect(response.status).toBe(400);
    });

    it('should return 400 if saison is not a positive integer', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validEvent, saison: -1 });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/events', () => {
    beforeEach(async () => {
      // Create test events
      await db.event.create({
        data: {
          date: new Date('2024-06-15'),
          nom: 'Event 1',
          horaireArrivee: '14:00',
          horaireDepart: '17:00',
          nombreBenevolesRequis: 5,
          saison: 29,
        },
      });

      await db.event.create({
        data: {
          date: new Date('2024-09-20'),
          nom: 'Event 2',
          horaireArrivee: '18:00',
          horaireDepart: '22:00',
          nombreBenevolesRequis: 8,
          saison: 30,
        },
      });
    });

    it('should return all events', async () => {
      const response = await request(app).get('/api/events');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('should return events without authentication', async () => {
      const response = await request(app).get('/api/events');

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/events/:id', () => {
    let eventId;

    beforeEach(async () => {
      const event = await db.event.create({
        data: {
          date: new Date('2024-06-15'),
          nom: 'Test Event',
          description: 'Test description',
          horaireArrivee: '14:00',
          horaireDepart: '17:00',
          nombreSpectatursAttendus: 100,
          nombreBenevolesRequis: 5,
          saison: 29,
          commentaires: 'Test comments',
        },
      });
      eventId = event.id;
    });

    it('should return a single event by id', async () => {
      const response = await request(app).get(`/api/events/${eventId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', eventId);
      expect(response.body.nom).toBe('Test Event');
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app).get('/api/events/non-existent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/events/:id', () => {
    let eventId;

    beforeEach(async () => {
      const event = await db.event.create({
        data: {
          date: new Date('2024-06-15'),
          nom: 'Original Event',
          horaireArrivee: '14:00',
          horaireDepart: '17:00',
          nombreBenevolesRequis: 5,
          saison: 29,
        },
      });
      eventId = event.id;
    });

    it('should update an event with admin token', async () => {
      const response = await request(app)
        .put(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nom: 'Updated Event',
          nombreBenevolesRequis: 10,
        });

      expect(response.status).toBe(200);
      expect(response.body.nom).toBe('Updated Event');
      expect(response.body.nombreBenevolesRequis).toBe(10);
    });

    it('should deny update for volunteers', async () => {
      const response = await request(app)
        .put(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({ nom: 'Hacked' });

      expect(response.status).toBe(403);
    });

    it('should deny update without token', async () => {
      const response = await request(app)
        .put(`/api/events/${eventId}`)
        .send({ nom: 'Hacked' });

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .put('/api/events/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nom: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/events/:id', () => {
    let eventId;

    beforeEach(async () => {
      const event = await db.event.create({
        data: {
          date: new Date('2024-06-15'),
          nom: 'Event to delete',
          horaireArrivee: '14:00',
          horaireDepart: '17:00',
          nombreBenevolesRequis: 5,
          saison: 29,
        },
      });
      eventId = event.id;
    });

    it('should delete an event with admin token', async () => {
      const response = await request(app)
        .delete(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verify deletion
      const event = await db.event.findUnique({ where: { id: eventId } });
      expect(event).toBeNull();
    });

    it('should deny delete for volunteers', async () => {
      const response = await request(app)
        .delete(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(403);
    });

    it('should deny delete without token', async () => {
      const response = await request(app).delete(`/api/events/${eventId}`);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .delete('/api/events/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
