import { Schema, model, models } from 'mongoose';

const channelSchema = new Schema({
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
  timestamps: true,
  // Edge runtime optimizations
  collection: 'channels',
  bufferCommands: false,
  autoIndex: false // Pre-build indexes for production
});

// Pre-defined indexes for edge performance
channelSchema.index({ category: 1, isActive: 1, 'metrics.subscriberCount': -1 });
channelSchema.index({ tags: 1, isActive: 1 });
channelSchema.index({ 'metrics.growthRate7d': -1, isActive: 1 });
channelSchema.index({ lastIndexed: 1 }, { expireAfterSeconds: 2592000 });

// Static methods optimized for edge runtime
channelSchema.statics = {
  async findPopular(limit = 20, filters = {}) {
    const query = { isActive: true, ...filters };

    // Use lean for edge performance
    return this.find(query)
      .lean()
      .sort({ 'metrics.subscriberCount': -1, 'metrics.growthRate7d': -1 })
      .limit(limit)
      .select('title username description category language metrics tags lastPostAt')
      .exec();
  },

  async searchChannels(query, limit = 20, filters = {}) {
    const searchQuery = {
      isActive: true,
      $text: { $search: query },
      ...filters
    };

    return this.find(searchQuery, { score: { $meta: 'textScore' } })
      .lean()
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .select('title username description category language metrics tags lastPostAt')
      .exec();
  },

  async findByCategory(category, limit = 20) {
    return this.find({ category, isActive: true })
      .lean()
      .sort({ 'metrics.subscriberCount': -1 })
      .limit(limit)
      .select('title username description category language metrics tags lastPostAt')
      .exec();
  }
};

// Export existing model or create new one
export default models.Channel || model('Channel', channelSchema);