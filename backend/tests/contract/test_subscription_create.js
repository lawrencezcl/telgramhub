const request = require('supertest');
const app = require('../../src/app');

describe('Subscriptions API Contract Tests', () => {
  describe('POST /api/subscriptions', () => {
    it('should create a new keyword subscription', async () => {
      const subscriptionData = {
        keyword: 'blockchain',
        filters: {
          categories: ['technology'],
          minSubscribers: 1000,
          languages: ['en']
        }
      };

      const response = await request(app)
        .post('/api/subscriptions')
        .set('Authorization', 'Bearer mock-token')
        .send(subscriptionData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('keyword', 'blockchain');
      expect(response.body).toHaveProperty('isActive', true);
      expect(response.body.filters).toEqual(subscriptionData.filters);
    });

    it('should return 400 for missing keyword', async () => {
      const subscriptionData = {
        filters: {
          categories: ['technology']
        }
      };

      await request(app)
        .post('/api/subscriptions')
        .set('Authorization', 'Bearer mock-token')
        .send(subscriptionData)
        .expect(400);
    });

    it('should return 401 for missing authorization', async () => {
      const subscriptionData = {
        keyword: 'blockchain'
      };

      await request(app)
        .post('/api/subscriptions')
        .send(subscriptionData)
        .expect(401);
    });

    it('should return 409 for duplicate subscription', async () => {
      const subscriptionData = {
        keyword: 'blockchain'
      };

      // First request should succeed
      await request(app)
        .post('/api/subscriptions')
        .set('Authorization', 'Bearer mock-token')
        .send(subscriptionData)
        .expect(201);

      // Second request should fail
      await request(app)
        .post('/api/subscriptions')
        .set('Authorization', 'Bearer mock-token')
        .send(subscriptionData)
        .expect(409);
    });
  });
});