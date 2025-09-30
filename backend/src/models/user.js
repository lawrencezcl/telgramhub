const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    sparse: true
  },
  firstName: {
    type: String,
    required: true
  },
  notificationPreferences: {
    frequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly'],
      default: 'daily'
    },
    maxPerDay: {
      type: Number,
      default: 10,
      min: 1,
      max: 50
    },
    keywords: [{
      type: String,
      trim: true
    }]
  },
  privacy: {
    dataRetention: {
      type: String,
      enum: ['30days', '90days', 'indefinite'],
      default: '90days'
    },
    analyticsOptIn: {
      type: Boolean,
      default: false
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for lastActive cleanup
userSchema.index({ lastActive: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

// Static methods
userSchema.statics.findByTelegramId = function(telegramId) {
  return this.findOne({ telegramId });
};

userSchema.statics.updateLastActive = function(userId) {
  return this.findByIdAndUpdate(userId, { lastActive: new Date() });
};

// Instance methods
userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);