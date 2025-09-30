const express = require('express');
const router = express.Router();
const Channel = require('../models/channel');
const logger = require('../utils/logger');

/**
 * GET /api/channels
 * Get popular channels with filtering and pagination
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      minSubscribers,
      maxSubscribers,
      language,
      activity
    } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (language) filters.language = language;
    if (minSubscribers) filters['metrics.subscriberCount'] = { $gte: parseInt(minSubscribers) };
    if (maxSubscribers) {
      if (filters['metrics.subscriberCount']) {
        filters['metrics.subscriberCount'].$lte = parseInt(maxSubscribers);
      } else {
        filters['metrics.subscriberCount'] = { $lte: parseInt(maxSubscribers) };
      }
    }

    if (activity) {
      const activityMap = {
        low: { $lt: 1 },
        medium: { $gte: 1, $lte: 5 },
        high: { $gt: 5 }
      };
      filters['metrics.postsPerDay'] = activityMap[activity];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const channels = await Channel.find(filters)
      .sort({ 'metrics.subscriberCount': -1, 'metrics.growthRate7d': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('title username description category language metrics tags lastPostAt')
      .lean();

    const total = await Channel.countDocuments(filters);

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      hasNext: skip + channels.length < total,
      hasPrev: page > 1
    };

    res.json({
      channels,
      pagination
    });
  } catch (error) {
    logger.error('Error in GET /api/channels:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/channels/search
 * Search channels by query
 */
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const channels = await Channel.searchChannels(q, parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Channel.countDocuments({
      isActive: true,
      $text: { $search: q }
    });

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      hasNext: skip + channels.length < total,
      hasPrev: page > 1
    };

    res.json({
      channels,
      pagination,
      searchQuery: q
    });
  } catch (error) {
    logger.error('Error in GET /api/channels/search:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/channels/:id
 * Get channel details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const channel = await Channel.findById(id)
      .populate('similarChannels', 'title username subscriberCount category')
      .lean();

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Get recent posts (mock data for now)
    channel.recentPosts = [];

    // Find similar channels based on category and tags
    const similarChannels = await Channel.find({
      _id: { $ne: id },
      category: channel.category,
      isActive: true
    })
      .limit(5)
      .select('title username subscriberCount category')
      .lean();

    channel.similarChannels = similarChannels;

    res.json(channel);
  } catch (error) {
    logger.error('Error in GET /api/channels/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/channels/:id/join
 * Generate join link for channel
 */
router.post('/:id/join', async (req, res) => {
  try {
    const { id } = req.params;

    const channel = await Channel.findById(id);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    if (!channel.isPublic) {
      return res.status(400).json({ error: 'Cannot join private channel' });
    }

    const joinLink = `https://t.me/${channel.username.replace('@', '')}`;

    res.json({
      joinLink,
      channelTitle: channel.title
    });
  } catch (error) {
    logger.error('Error in POST /api/channels/:id/join:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;