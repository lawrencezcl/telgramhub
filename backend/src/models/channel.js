const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  telegramId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  language: {
    type: String,
    default: 'en'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  metrics: {
    subscriberCount: {
      type: Number,
      default: 0,
      index: true
    },
    growthRate7d: {
      type: Number,
      default: 0
    },
    growthRate30d: {
      type: Number,
      default: 0
    },
    postsPerDay: {
      type: Number,
      default: 0
    },
    lastPostAt: {
      type: Date
    },
    engagementScore: {
      type: Number,
      default: 0
    }
  },
  tags: [{
    type: String,
    trim: true,
    index: true
  }],
  lastIndexed: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
channelSchema.index({ category: 1, isActive: 1, 'metrics.subscriberCount': -1 });
channelSchema.index({ tags: 1, isActive: 1 });
channelSchema.index({ 'metrics.growthRate7d': -1, isActive: 1 });
channelSchema.index({ lastIndexed: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

// Static methods
channelSchema.statics.findPopular = function(limit = 20, filters = {}) {
  const query = { isActive: true, ...filters };

  return this.find(query)
    .sort({
      'metrics.subscriberCount': -1,
      'metrics.growthRate7d': -1
    })
    .limit(limit)
    .select('title username description category language metrics tags lastPostAt');
};

channelSchema.statics.searchChannels = function(query, limit = 20, filters = {}) {
  const searchQuery = {
    isActive: true,
    $text: { $search: query },
    ...filters
  };

  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .select('title username description category language metrics tags lastPostAt');
};

channelSchema.statics.findByCategory = function(category, limit = 20) {
  return this.find({ category, isActive: true })
    .sort({ 'metrics.subscriberCount': -1 })
    .limit(limit)
    .select('title username description category language metrics tags lastPostAt');
};

// Instance methods
channelSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

channelSchema.methods.updateMetrics = function(metrics) {
  Object.assign(this.metrics, metrics);
  this.lastIndexed = new Date();
  return this.save();
};

module.exports = mongoose.model('Channel', channelSchema);