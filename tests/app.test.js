const request = require('supertest');
const app = require('../src/app');

describe('App - Sanity Check', () => {
  describe('GET /', () => {
    it('should return 200 OK with welcome message', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Bienvenue sur la plateforme Baie des Singes');
    });

    it('should return JSON content-type', async () => {
      const response = await request(app).get('/');

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('GET /api/health', () => {
    it('should return 200 OK with status healthy', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
      });
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/nonexistent');

      expect(response.status).toBe(404);
    });
  });
});
