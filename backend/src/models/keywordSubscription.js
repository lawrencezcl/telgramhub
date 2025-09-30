const mongoose = require('mongoose');

const keywordSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  keyword: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    minlength: 2,
    maxlength: 50
  },
  filters: {
    categories: [{
      type: String,
      trim: true
    }],
    minSubscribers: {
      type: Number,
      default: 0,
      min: 0
    },
    languages: [{
      type: String,
      trim: true
    }]
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  matchedChannels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  }],
  lastNotificationAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound unique index
keywordSubscriptionSchema.index({ userId: 1, keyword: 1 }, { unique: true });
keywordSubscriptionSchema.index({ keyword: 1, isActive: 1 });

// Static methods
keywordSubscriptionSchema.statics.findByUser = function(userId) {
  return this.find({ userId, isActive: true })
    .populate('matchedChannels', 'title username subscriberCount category');
};

keywordSubscriptionSchema.statics.findByKeyword = function(keyword) {
  return this.find({ keyword, isActive: true })
    .populate('userId', 'telegramId firstName');
};

keywordSubscriptionSchema.statics.findActiveForChannel = function(channel) {
  const query = {
    isActive: true,
    $and: [
      {
        $or: [
          { keyword: { $regex: channel.title, $options: 'i' } },
          { keyword: { $regex: channel.description, $options: 'i' } },
          { keyword: { $in: channel.tags } }
        ]
      }
    ]
  };

  if (channel.category) {
    query.$and.push({
      $or: [
        { 'filters.categories': { $size: 0 } },
        { 'filters.categories': channel.category }
      ]
    });
  }

  if (channel.metrics && channel.metrics.subscriberCount) {
    query.$and.push({
      $or: [
        { 'filters.minSubscribers': { $lte: 0 } },
        { 'filters.minSubscribers': { $lte: channel.metrics.subscriberCount } }
      ]
    });
  }

  return this.find(query).populate('userId');
};

// Instance methods
keywordSubscriptionSchema.methods.addMatchedChannel = function(channelId) {
  if (!this.matchedChannels.includes(channelId)) {
    this.matchedChannels.push(channelId);
    this.lastNotificationAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

keywordSubscriptionSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('KeywordSubscription', keywordSubscriptionSchema);