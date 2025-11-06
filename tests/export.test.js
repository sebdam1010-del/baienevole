const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/utils/db');
const bcrypt = require('bcrypt');

describe('GET /api/events/export/csv', () => {
  let adminToken;
  let volunteerToken;
  let event1, event2, event3;
  let volunteer1, volunteer2;

  beforeAll(async () => {
    // Clean database
    await prisma.eventRegistration.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();

    // Create admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      },
    });

    // Create volunteers
    const volunteerPassword = await bcrypt.hash('volunteer123', 10);
    volunteer1 = await prisma.user.create({
      data: {
        email: 'volunteer1@test.com',
        password: volunteerPassword,
        firstName: 'Marie',
        lastName: 'Dupont',
        role: 'VOLUNTEER',
      },
    });

    volunteer2 = await prisma.user.create({
      data: {
        email: 'volunteer2@test.com',
        password: volunteerPassword,
        firstName: 'Pierre',
        lastName: 'Martin',
        role: 'VOLUNTEER',
      },
    });

    // Login as admin
    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });
    adminToken = adminLoginResponse.body.token;

    // Login as volunteer
    const volunteerLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'volunteer1@test.com', password: 'volunteer123' });
    volunteerToken = volunteerLoginResponse.body.token;

    // Create events
    const now = new Date();
    event1 = await prisma.event.create({
      data: {
        nom: 'Spectacle 1',
        description: 'Description 1',
        date: new Date(2024, 8, 15), // September 2024
        horaireArrivee: '14:00',
        horaireDepart: '17:30',
        nombreSpectatursAttendus: 150,
        nombreBenevolesRequis: 5,
        saison: 29,
        commentaires: 'Test comment 1',
      },
    });

    event2 = await prisma.event.create({
      data: {
        nom: 'Spectacle 2',
        description: 'Description 2',
        date: new Date(2024, 9, 20), // October 2024
        horaireArrivee: '19:00',
        horaireDepart: '22:00',
        nombreSpectatursAttendus: 200,
        nombreBenevolesRequis: 8,
        saison: 29,
        commentaires: 'Test comment 2',
      },
    });

    event3 = await prisma.event.create({
      data: {
        nom: 'Spectacle 3',
        description: 'Description 3',
        date: new Date(2025, 0, 15), // January 2025
        horaireArrivee: '18:00',
        horaireDepart: '21:00',
        nombreSpectatursAttendus: 120,
        nombreBenevolesRequis: 6,
        saison: 30,
        commentaires: 'Test comment 3',
      },
    });

    // Create registrations
    await prisma.eventRegistration.create({
      data: { eventId: event1.id, userId: volunteer1.id },
    });

    await prisma.eventRegistration.create({
      data: { eventId: event1.id, userId: volunteer2.id },
    });

    await prisma.eventRegistration.create({
      data: { eventId: event2.id, userId: volunteer1.id },
    });
  });

  afterAll(async () => {
    await prisma.eventRegistration.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('should export all events as CSV', async () => {
    const response = await request(app)
      .get('/api/events/export/csv')
      .expect(200);

    expect(response.headers['content-type']).toContain('text/csv');
    expect(response.headers['content-disposition']).toContain('attachment');
    expect(response.text).toContain('date,nom,saison,nombre_spectateurs_attendus');
    expect(response.text).toContain('Spectacle 1');
    expect(response.text).toContain('Spectacle 2');
    expect(response.text).toContain('Spectacle 3');
  });

  it('should include all required columns in CSV', async () => {
    const response = await request(app)
      .get('/api/events/export/csv')
      .expect(200);

    const lines = response.text.split('\n');
    const header = lines[0];

    expect(header).toContain('date');
    expect(header).toContain('nom');
    expect(header).toContain('saison');
    expect(header).toContain('nombre_spectateurs_attendus');
    expect(header).toContain('nombre_bénévoles_requis');
    expect(header).toContain('nombre_inscrits');
    expect(header).toContain('statut_quota');
    expect(header).toContain('bénévoles_inscrits');
    expect(header).toContain('commentaires');
  });

  it('should filter events by saison', async () => {
    const response = await request(app)
      .get('/api/events/export/csv?saison=29')
      .expect(200);

    expect(response.text).toContain('Spectacle 1');
    expect(response.text).toContain('Spectacle 2');
    expect(response.text).not.toContain('Spectacle 3');
  });

  it('should filter events by annee (year)', async () => {
    const response = await request(app)
      .get('/api/events/export/csv?annee=2024')
      .expect(200);

    expect(response.text).toContain('Spectacle 1');
    expect(response.text).toContain('Spectacle 2');
    expect(response.text).not.toContain('Spectacle 3');
  });

  it('should combine saison and annee filters', async () => {
    const response = await request(app)
      .get('/api/events/export/csv?saison=29&annee=2024')
      .expect(200);

    expect(response.text).toContain('Spectacle 1');
    expect(response.text).toContain('Spectacle 2');
    expect(response.text).not.toContain('Spectacle 3');
  });

  it('should include list of registered volunteers', async () => {
    const response = await request(app)
      .get('/api/events/export/csv')
      .expect(200);

    const lines = response.text.split('\n');
    const event1Line = lines.find(line => line.includes('Spectacle 1'));

    expect(event1Line).toContain('Marie Dupont;Pierre Martin');
  });

  it('should calculate quota status correctly', async () => {
    const response = await request(app)
      .get('/api/events/export/csv')
      .expect(200);

    const lines = response.text.split('\n');
    const event1Line = lines.find(line => line.includes('Spectacle 1'));
    const event2Line = lines.find(line => line.includes('Spectacle 2'));

    // Event 1: 2 inscrits / 5 requis = GREEN
    expect(event1Line).toContain('GREEN');

    // Event 2: 1 inscrit / 8 requis = GREEN
    expect(event2Line).toContain('GREEN');
  });

  it('should return UTF-8 encoded CSV for French characters', async () => {
    const response = await request(app)
      .get('/api/events/export/csv')
      .expect(200);

    expect(response.headers['content-type']).toContain('charset=utf-8');
    expect(response.text).toContain('bénévoles');
  });

  it('should return empty CSV body with headers if no events match filters', async () => {
    const response = await request(app)
      .get('/api/events/export/csv?saison=99')
      .expect(200);

    const lines = response.text.trim().split('\n');
    expect(lines.length).toBe(1); // Only header
    expect(lines[0]).toContain('date,nom,saison');
  });
});
