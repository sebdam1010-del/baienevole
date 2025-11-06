const request = require('supertest');
const app = require('../src/app');
const db = require('../src/utils/db');

describe('Roles & Permissions', () => {
  let adminToken;
  let volunteerToken;
  let adminUser;
  let volunteerUser;

  beforeEach(async () => {
    await db.user.deleteMany();

    // Create an admin user
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@example.com',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
      });

    adminToken = adminResponse.body.token;
    adminUser = adminResponse.body.user;

    // Manually set as admin (normally done by super admin)
    await db.user.update({
      where: { id: adminUser.id },
      data: { role: 'ADMIN' },
    });

    // Create a volunteer user
    const volunteerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'volunteer@example.com',
        password: 'Volunteer123!',
        firstName: 'Volunteer',
        lastName: 'User',
      });

    volunteerToken = volunteerResponse.body.token;
    volunteerUser = volunteerResponse.body.user;
  });

  afterAll(async () => {
    await db.user.deleteMany();
    await db.$disconnect();
  });

  describe('User Roles', () => {
    it('should assign VOLUNTEER role by default on registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'Password123!',
          firstName: 'New',
          lastName: 'User',
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toHaveProperty('role', 'VOLUNTEER');
    });

    it('should return user role in login response', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'volunteer@example.com',
          password: 'Volunteer123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('role', 'VOLUNTEER');
    });
  });

  describe('Authentication Middleware', () => {
    it('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('volunteer@example.com');
    });

    it('should deny access without token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should deny access with malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Admin Middleware', () => {
    it('should allow admin to access admin routes', async () => {
      // First, get fresh token with admin role
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'Admin123!',
        });

      const response = await request(app)
        .get('/api/admin/test')
        .set('Authorization', `Bearer ${loginResponse.body.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should deny volunteer access to admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/test')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('admin');
    });

    it('should deny access to admin routes without token', async () => {
      const response = await request(app).get('/api/admin/test');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});
