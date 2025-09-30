import { Schema, model, models } from 'mongoose';

const userSchema = new Schema({
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
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  bufferCommands: false,
  autoIndex: false
});

userSchema.index({ lastActive: 1 }, { expireAfterSeconds: 2592000 });

userSchema.statics = {
  async findByTelegramId(telegramId) {
    return this.findOne({ telegramId }).lean().exec();
  },

  async updateLastActive(userId) {
    return this.findByIdAndUpdate(
      userId,
      { lastActive: new Date() },
      { new: true }
    ).lean().exec();
  }
};

export default models.User || model('User', userSchema);