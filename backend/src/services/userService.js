const User = require('../models/user');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class UserService {
  /**
   * Find or create user from Telegram data
   */
  async findOrCreateUser(telegramData) {
    const { id, username, first_name } = telegramData;

    try {
      let user = await User.findByTelegramId(id);

      if (!user) {
        user = new User({
          telegramId: id,
          username,
          firstName: first_name
        });
        await user.save();
        logger.info(`New user created: ${id}`);
      } else {
        // Update user info if changed
        if (user.username !== username || user.firstName !== first_name) {
          user.username = username;
          user.firstName = first_name;
          await user.save();
        }

        // Update last active
        await User.updateLastActive(user._id);
      }

      return user;
    } catch (error) {
      logger.error('Error in findOrCreateUser:', error);
      throw error;
    }
  }

  /**
   * Generate JWT token for user
   */
  generateToken(user) {
    const payload = {
      userId: user._id,
      telegramId: user.telegramId,
      firstName: user.firstName
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      logger.error('Error in getUserById:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId, preferences) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'notificationPreferences.frequency': preferences.frequency,
            'notificationPreferences.maxPerDay': preferences.maxPerDay,
            'privacy.dataRetention': preferences.dataRetention,
            'privacy.analyticsOptIn': preferences.analyticsOptIn
          }
        },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Error in updatePreferences:', error);
      throw error;
    }
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId) {
    try {
      const user = await User.findById(userId)
        .select('notificationPreferences privacy');

      if (!user) {
        throw new Error('User not found');
      }

      return {
        notificationFrequency: user.notificationPreferences.frequency,
        maxNotificationsPerDay: user.notificationPreferences.maxPerDay,
        dataRetention: user.privacy.dataRetention,
        analyticsOptIn: user.privacy.analyticsOptIn
      };
    } catch (error) {
      logger.error('Error in getPreferences:', error);
      throw error;
    }
  }

  /**
   * Delete user data (GDPR compliance)
   */
  async deleteUser(userId) {
    try {
      const result = await User.findByIdAndDelete(userId);
      if (!result) {
        throw new Error('User not found');
      }

      logger.info(`User data deleted: ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error in deleteUser:', error);
      throw error;
    }
  }

  /**
   * Export user data (GDPR compliance)
   */
  async exportUserData(userId) {
    try {
      const user = await User.findById(userId)
        .populate({
          path: 'keywordSubscriptions',
          populate: {
            path: 'matchedChannels',
            select: 'title username subscriberCount category'
          }
        });

      if (!user) {
        throw new Error('User not found');
      }

      return user.toSafeObject();
    } catch (error) {
      logger.error('Error in exportUserData:', error);
      throw error;
    }
  }
}

module.exports = new UserService();