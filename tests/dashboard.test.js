const request = require('supertest');
const app = require('../src/app');
const db = require('../src/utils/db');

describe('Volunteer Dashboard API', () => {
  let volunteerToken;
  let volunteerUserId;
  let pastEvent;
  let upcomingEvent;
  let futureEvent;
  let unregisteredEvent;

  beforeEach(async () => {
    // Clean up
    await db.eventRegistration.deleteMany();
    await db.event.deleteMany();
    await db.user.deleteMany();

    await new Promise((resolve) => setTimeout(resolve, 10));

    // Create volunteer
    const volunteerEmail = `dashboard-volunteer-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
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

    // Create test events
    const now = new Date();

    // Past event (2 days ago)
    const pastDate = new Date(now);
    pastDate.setDate(pastDate.getDate() - 2);
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

    // Upcoming event (tomorrow)
    const upcomingDate = new Date(now);
    upcomingDate.setDate(upcomingDate.getDate() + 1);
    upcomingDate.setHours(14, 0, 0, 0);
    upcomingEvent = await db.event.create({
      data: {
        date: upcomingDate,
        nom: 'Upcoming Event',
        horaireArrivee: '14:00',
        horaireDepart: '18:00',
        nombreBenevolesRequis: 5,
        saison: 29,
      },
    });

    // Future event (in 7 days)
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + 7);
    futureEvent = await db.event.create({
      data: {
        date: futureDate,
        nom: 'Future Event',
        horaireArrivee: '10:00',
        horaireDepart: '16:00',
        nombreBenevolesRequis: 8,
        saison: 29,
      },
    });

    // Unregistered event (volunteer not registered to this one)
    const unregisteredDate = new Date(now);
    unregisteredDate.setDate(unregisteredDate.getDate() + 3);
    unregisteredEvent = await db.event.create({
      data: {
        date: unregisteredDate,
        nom: 'Unregistered Event',
        horaireArrivee: '09:00',
        horaireDepart: '12:00',
        nombreBenevolesRequis: 3,
        saison: 29,
      },
    });

    // Register volunteer to past, upcoming, and future events
    await db.eventRegistration.create({
      data: {
        eventId: pastEvent.id,
        userId: volunteerUserId,
      },
    });

    await db.eventRegistration.create({
      data: {
        eventId: upcomingEvent.id,
        userId: volunteerUserId,
      },
    });

    await db.eventRegistration.create({
      data: {
        eventId: futureEvent.id,
        userId: volunteerUserId,
      },
    });
  });

  afterAll(async () => {
    await db.eventRegistration.deleteMany();
    await db.event.deleteMany();
    await db.user.deleteMany();
    await db.$disconnect();
  });

  describe('GET /api/dashboard/my-events', () => {
    it('should return all events the volunteer is registered to', async () => {
      const response = await request(app)
        .get('/api/dashboard/my-events')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3); // past, upcoming, future

      // Check that all registered events are included
      const eventNames = response.body.map((e) => e.nom);
      expect(eventNames).toContain('Past Event');
      expect(eventNames).toContain('Upcoming Event');
      expect(eventNames).toContain('Future Event');
      expect(eventNames).not.toContain('Unregistered Event');
    });

    it('should order events by date (oldest first)', async () => {
      const response = await request(app)
        .get('/api/dashboard/my-events')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(200);
      expect(response.body[0].nom).toBe('Past Event');
      expect(response.body[1].nom).toBe('Upcoming Event');
      expect(response.body[2].nom).toBe('Future Event');
    });

    it('should include quota status for each event', async () => {
      const response = await request(app)
        .get('/api/dashboard/my-events')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(200);
      expect(response.body[0]).toHaveProperty('quotaStatus');
      expect(response.body[0].quotaStatus).toHaveProperty('color');
      expect(response.body[0].quotaStatus).toHaveProperty('registered');
      expect(response.body[0].quotaStatus).toHaveProperty('required');
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/dashboard/my-events');

      expect(response.status).toBe(401);
    });

    it('should return empty array if volunteer has no registrations', async () => {
      // Create a new volunteer without any registrations
      const newVolunteerEmail = `new-volunteer-${Date.now()}@example.com`;
      const newVolunteerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: newVolunteerEmail,
          password: 'Volunteer123!',
          firstName: 'Jane',
          lastName: 'Smith',
        });

      const response = await request(app)
        .get('/api/dashboard/my-events')
        .set('Authorization', `Bearer ${newVolunteerResponse.body.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/dashboard/upcoming', () => {
    it('should return only future events (not past)', async () => {
      const response = await request(app)
        .get('/api/dashboard/upcoming')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2); // upcoming and future only

      const eventNames = response.body.map((e) => e.nom);
      expect(eventNames).toContain('Upcoming Event');
      expect(eventNames).toContain('Future Event');
      expect(eventNames).not.toContain('Past Event');
    });

    it('should order upcoming events by date (soonest first)', async () => {
      const response = await request(app)
        .get('/api/dashboard/upcoming')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(200);
      expect(response.body[0].nom).toBe('Upcoming Event');
      expect(response.body[1].nom).toBe('Future Event');
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/dashboard/upcoming');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/dashboard/history', () => {
    it('should return only past events', async () => {
      const response = await request(app)
        .get('/api/dashboard/history')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);

      expect(response.body[0].nom).toBe('Past Event');
    });

    it('should order history by date (most recent first)', async () => {
      // Create another past event
      const olderDate = new Date();
      olderDate.setDate(olderDate.getDate() - 5);
      const olderEvent = await db.event.create({
        data: {
          date: olderDate,
          nom: 'Older Event',
          horaireArrivee: '14:00',
          horaireDepart: '18:00',
          nombreBenevolesRequis: 5,
          saison: 29,
        },
      });

      await db.eventRegistration.create({
        data: {
          eventId: olderEvent.id,
          userId: volunteerUserId,
        },
      });

      const response = await request(app)
        .get('/api/dashboard/history')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      // Most recent past event first
      expect(response.body[0].nom).toBe('Past Event');
      expect(response.body[1].nom).toBe('Older Event');
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/dashboard/history');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/dashboard/stats', () => {
    it('should return volunteer statistics', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalEvents');
      expect(response.body).toHaveProperty('upcomingEvents');
      expect(response.body).toHaveProperty('pastEvents');
      expect(response.body).toHaveProperty('totalHours');
    });

    it('should calculate correct event counts', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.totalEvents).toBe(3);
      expect(response.body.upcomingEvents).toBe(2);
      expect(response.body.pastEvents).toBe(1);
    });

    it('should calculate total volunteer hours', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(200);
      // Past: 14:00-18:00 = 4 hours
      // Upcoming: 14:00-18:00 = 4 hours
      // Future: 10:00-16:00 = 6 hours
      // Total: 14 hours
      expect(response.body.totalHours).toBe(14);
    });

    it('should return zero stats for volunteer with no registrations', async () => {
      // Create a new volunteer without any registrations
      const newVolunteerEmail = `new-volunteer-${Date.now()}@example.com`;
      const newVolunteerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: newVolunteerEmail,
          password: 'Volunteer123!',
          firstName: 'Jane',
          lastName: 'Smith',
        });

      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${newVolunteerResponse.body.token}`);

      expect(response.status).toBe(200);
      expect(response.body.totalEvents).toBe(0);
      expect(response.body.upcomingEvents).toBe(0);
      expect(response.body.pastEvents).toBe(0);
      expect(response.body.totalHours).toBe(0);
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/dashboard/stats');

      expect(response.status).toBe(401);
    });
  });
});
