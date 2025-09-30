const request = require('supertest');
const app = require('../../src/app');

describe('Channels API Contract Tests', () => {
  describe('GET /api/channels', () => {
    it('should return a list of channels with pagination', async () => {
      const response = await request(app)
        .get('/api/channels')
        .expect(200);

      expect(response.body).toHaveProperty('channels');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.channels)).toBe(true);

      if (response.body.channels.length > 0) {
        const channel = response.body.channels[0];
        expect(channel).toHaveProperty('id');
        expect(channel).toHaveProperty('title');
        expect(channel).toHaveProperty('subscriberCount');
        expect(channel).toHaveProperty('category');
      }
    });

    it('should support filtering by category', async () => {
      const response = await request(app)
        .get('/api/channels?category=technology')
        .expect(200);

      expect(response.body).toHaveProperty('channels');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/channels?page=1&limit=10')
        .expect(200);

      expect(response.body.pagination).toHaveProperty('currentPage', 1);
      expect(response.body.pagination).toHaveProperty('hasNext');
      expect(response.body.pagination).toHaveProperty('hasPrev');
    });

    it('should return 400 for invalid limit parameter', async () => {
      await request(app)
        .get('/api/channels?limit=invalid')
        .expect(400);
    });
  });
});