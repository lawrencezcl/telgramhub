const request = require('supertest');
const app = require('../../src/app');

describe('Channel Discovery Integration Tests', () => {
  describe('Complete Channel Discovery Workflow', () => {
    it('should allow users to discover and explore channels', async () => {
      // Step 1: Get popular channels
      const popularResponse = await request(app)
        .get('/api/channels')
        .expect(200);

      expect(popularResponse.body.channels).toBeDefined();
      expect(Array.isArray(popularResponse.body.channels)).toBe(true);

      // Step 2: Search for specific channels
      const searchResponse = await request(app)
        .get('/api/channels/search?q=technology')
        .expect(200);

      expect(searchResponse.body.channels).toBeDefined();
      expect(searchResponse.body.searchQuery).toBe('technology');

      // Step 3: Get channel details
      if (popularResponse.body.channels.length > 0) {
        const channelId = popularResponse.body.channels[0].id;

        const detailResponse = await request(app)
          .get(`/api/channels/${channelId}`)
          .expect(200);

        expect(detailResponse.body).toHaveProperty('id', channelId);
        expect(detailResponse.body).toHaveProperty('recentPosts');
        expect(detailResponse.body).toHaveProperty('similarChannels');
      }

      // Step 4: Generate join link
      if (popularResponse.body.channels.length > 0) {
        const channelId = popularResponse.body.channels[0].id;

        const joinResponse = await request(app)
          .post(`/api/channels/${channelId}/join`)
          .set('Authorization', 'Bearer mock-token')
          .expect(200);

        expect(joinResponse.body).toHaveProperty('joinLink');
        expect(joinResponse.body.joinLink).toMatch(/^https:\/\/t\.me\//);
      }
    });

    it('should handle filtering and pagination correctly', async () => {
      // Test category filtering
      const categoryResponse = await request(app)
        .get('/api/channels?category=technology&limit=5')
        .expect(200);

      expect(categoryResponse.body.channels.length).toBeLessThanOrEqual(5);

      // All channels should be in the specified category
      categoryResponse.body.channels.forEach(channel => {
        expect(channel.category).toBe('technology');
      });

      // Test subscriber count filtering
      const subscriberResponse = await request(app)
        .get('/api/channels?minSubscribers=10000')
        .expect(200);

      subscriberResponse.body.channels.forEach(channel => {
        expect(channel.subscriberCount).toBeGreaterThanOrEqual(10000);
      });
    });
  });
});