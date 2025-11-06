const request = require('supertest');
const app = require('../src/app');
const db = require('../src/utils/db');

describe('Event Registration API', () => {
  let volunteerToken;
  let volunteer2Token;
  let volunteerUserId;
  let volunteer2UserId;
  let adminToken;
  let futureEvent; // Event in more than 24h
  let soonEvent; // Event in less than 24h
  let pastEvent; // Event in the past

  beforeEach(async () => {
    // Clean up
    await db.eventRegistration.deleteMany();
    await db.event.deleteMany();
    await db.user.deleteMany();

    await new Promise((resolve) => setTimeout(resolve, 10));

    // Create admin
    const adminEmail = `reg-admin-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
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
    const volunteerEmail = `reg-volunteer-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
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
    const volunteer2Email = `reg-volunteer2-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
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

    // Create test events
    const now = new Date();

    // Future event (in 3 days)
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + 3);
    futureEvent = await db.event.create({
      data: {
        date: futureDate,
        nom: 'Future Event',
        horaireArrivee: '14:00',
        horaireDepart: '18:00',
        nombreBenevolesRequis: 5,
        saison: 29,
      },
    });

    // Soon event (in 12 hours - less than 24h)
    const soonDate = new Date(now);
    soonDate.setHours(soonDate.getHours() + 12);
    soonEvent = await db.event.create({
      data: {
        date: soonDate,
        nom: 'Soon Event',
        horaireArrivee: '14:00',
        horaireDepart: '18:00',
        nombreBenevolesRequis: 5,
        saison: 29,
      },
    });

    // Past event
    const pastDate = new Date(now);
    pastDate.setDate(pastDate.getDate() - 1);
    pastEvent = await db.event.create({
      data: {
        date: pastDate,
        nom: 'Past Event',
        horaireArrivee: '14:00',
        horaireDepart: '18:00',
        nombreBenevolesRequis: 5,
        saison: 29,
      },
    });
  });

  afterAll(async () => {
    await db.eventRegistration.deleteMany();
    await db.event.deleteMany();
    await db.user.deleteMany();
    await db.$disconnect();
  });

  describe('POST /api/events/:id/register', () => {
    it('should allow volunteer to register for future event', async () => {
      const response = await request(app)
        .post(`/api/events/${futureEvent.id}/register`)
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('registration');
      expect(response.body.registration.eventId).toBe(futureEvent.id);
      expect(response.body.registration.userId).toBe(volunteerUserId);

      // Verify in database
      const registration = await db.eventRegistration.findFirst({
        where: {
          eventId: futureEvent.id,
          userId: volunteerUserId,
        },
      });
      expect(registration).not.toBeNull();
    });

    it('should block registration for event in less than 24 hours', async () => {
      const response = await request(app)
        .post(`/api/events/${soonEvent.id}/register`)
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('24');
    });

    it('should block registration for past events', async () => {
      const response = await request(app)
        .post(`/api/events/${pastEvent.id}/register`)
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('24');
    });

    it('should prevent duplicate registration', async () => {
      // First registration
      await request(app)
        .post(`/api/events/${futureEvent.id}/register`)
        .set('Authorization', `Bearer ${volunteerToken}`);

      // Attempt duplicate registration
      const response = await request(app)
        .post(`/api/events/${futureEvent.id}/register`)
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already registered');
    });

    it('should allow registration even if quota is exceeded', async () => {
      // Create event with quota of 2
      const limitedEvent = await db.event.create({
        data: {
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          nom: 'Limited Event',
          horaireArrivee: '14:00',
          horaireDepart: '18:00',
          nombreBenevolesRequis: 2,
          saison: 29,
        },
      });

      // Register 2 volunteers (reaching quota)
      await request(app)
        .post(`/api/events/${limitedEvent.id}/register`)
        .set('Authorization', `Bearer ${volunteerToken}`);

      await request(app)
        .post(`/api/events/${limitedEvent.id}/register`)
        .set('Authorization', `Bearer ${volunteer2Token}`);

      // Create a third volunteer
      const volunteer3Email = `reg-volunteer3-${Date.now()}@example.com`;
      const volunteer3Response = await request(app)
        .post('/api/auth/register')
        .send({
          email: volunteer3Email,
          password: 'Volunteer123!',
          firstName: 'Bob',
          lastName: 'Johnson',
        });

      // Third volunteer should still be able to register (quota exceeded)
      const response = await request(app)
        .post(`/api/events/${limitedEvent.id}/register`)
        .set('Authorization', `Bearer ${volunteer3Response.body.token}`);

      expect(response.status).toBe(201);
    });

    it('should require authentication', async () => {
      const response = await request(app).post(`/api/events/${futureEvent.id}/register`);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .post('/api/events/non-existent-id/register')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(404);
    });

    it('should warn about conflicting events (same time)', async () => {
      // Create two overlapping events
      const date = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const event1 = await db.event.create({
        data: {
          date: date,
          nom: 'Event 1',
          horaireArrivee: '14:00',
          horaireDepart: '18:00',
          nombreBenevolesRequis: 5,
          saison: 29,
        },
      });

      const event2 = await db.event.create({
        data: {
          date: date,
          nom: 'Event 2',
          horaireArrivee: '16:00', // Overlaps with event1
          horaireDepart: '20:00',
          nombreBenevolesRequis: 5,
          saison: 29,
        },
      });

      // Register for first event
      await request(app)
        .post(`/api/events/${event1.id}/register`)
        .set('Authorization', `Bearer ${volunteerToken}`);

      // Register for overlapping event
      const response = await request(app)
        .post(`/api/events/${event2.id}/register`)
        .set('Authorization', `Bearer ${volunteerToken}`);

      // Should succeed but with warning
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('warning');
      expect(response.body.warning).toContain('conflict');
    });
  });

  describe('DELETE /api/events/:id/register', () => {
    beforeEach(async () => {
      // Register volunteer to future event
      await db.eventRegistration.create({
        data: {
          eventId: futureEvent.id,
          userId: volunteerUserId,
        },
      });
    });

    it('should allow volunteer to unregister from event', async () => {
      const response = await request(app)
        .delete(`/api/events/${futureEvent.id}/register`)
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verify removed from database
      const registration = await db.eventRegistration.findFirst({
        where: {
          eventId: futureEvent.id,
          userId: volunteerUserId,
        },
      });
      expect(registration).toBeNull();
    });

    it('should return 404 if not registered', async () => {
      const response = await request(app)
        .delete(`/api/events/${futureEvent.id}/register`)
        .set('Authorization', `Bearer ${volunteer2Token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not registered');
    });

    it('should require authentication', async () => {
      const response = await request(app).delete(`/api/events/${futureEvent.id}/register`);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .delete('/api/events/non-existent-id/register')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/events/:id - with quota status', () => {
    it('should return GREEN status when registrations within quota', async () => {
      // Register 3 volunteers for event requiring 5
      await db.eventRegistration.create({
        data: { eventId: futureEvent.id, userId: volunteerUserId },
      });
      await db.eventRegistration.create({
        data: { eventId: futureEvent.id, userId: volunteer2UserId },
      });

      const response = await request(app).get(`/api/events/${futureEvent.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('quotaStatus');
      expect(response.body.quotaStatus.color).toBe('green');
      expect(response.body.quotaStatus.code).toBe('#ABD4A9');
      expect(response.body.quotaStatus.registered).toBe(2);
      expect(response.body.quotaStatus.required).toBe(5);
    });

    it('should return ORANGE status when quota exceeded by 1-2', async () => {
      // Create event requiring 3 volunteers
      const event = await db.event.create({
        data: {
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          nom: 'Test Event',
          horaireArrivee: '14:00',
          horaireDepart: '18:00',
          nombreBenevolesRequis: 3,
          saison: 29,
        },
      });

      // Register 4 volunteers (quota + 1)
      const userIds = [volunteerUserId, volunteer2UserId];
      for (let i = 0; i < 2; i++) {
        await request(app)
          .post('/api/auth/register')
          .send({
            email: `extra${i}-${Date.now()}@example.com`,
            password: 'Test123!',
            firstName: 'Extra',
            lastName: `User${i}`,
          })
          .then((res) => userIds.push(res.body.user.id));
      }

      for (const userId of userIds) {
        await db.eventRegistration.create({
          data: { eventId: event.id, userId: userId },
        });
      }

      const response = await request(app).get(`/api/events/${event.id}`);

      expect(response.status).toBe(200);
      expect(response.body.quotaStatus.color).toBe('orange');
      expect(response.body.quotaStatus.code).toBe('#EF7856');
    });

    it('should return RED status when quota exceeded by more than 2', async () => {
      // Create event requiring 2 volunteers
      const event = await db.event.create({
        data: {
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          nom: 'Test Event',
          horaireArrivee: '14:00',
          horaireDepart: '18:00',
          nombreBenevolesRequis: 2,
          saison: 29,
        },
      });

      // Register 5 volunteers (quota + 3)
      const userIds = [volunteerUserId, volunteer2UserId];
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/auth/register')
          .send({
            email: `red${i}-${Date.now()}@example.com`,
            password: 'Test123!',
            firstName: 'Red',
            lastName: `User${i}`,
          })
          .then((res) => userIds.push(res.body.user.id));
      }

      for (const userId of userIds) {
        await db.eventRegistration.create({
          data: { eventId: event.id, userId: userId },
        });
      }

      const response = await request(app).get(`/api/events/${event.id}`);

      expect(response.status).toBe(200);
      expect(response.body.quotaStatus.color).toBe('red');
      expect(response.body.quotaStatus.code).toBe('#DD2D4A');
    });
  });

  describe('GET /api/events - with quota status for all events', () => {
    it('should include quota status for all events', async () => {
      // Register some volunteers
      await db.eventRegistration.create({
        data: { eventId: futureEvent.id, userId: volunteerUserId },
      });

      const response = await request(app).get('/api/events');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const event = response.body.find((e) => e.id === futureEvent.id);
      expect(event).toHaveProperty('quotaStatus');
      expect(event.quotaStatus).toHaveProperty('color');
      expect(event.quotaStatus).toHaveProperty('registered');
      expect(event.quotaStatus).toHaveProperty('required');
    });
  });
});
