import { db } from '@/lib/db';
import { User, Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';

export interface UserPreferences {
  notificationFrequency: string;
  maxNotificationsPerDay: number;
  dataRetention: string;
  analyticsOptIn: boolean;
}

export class UserModel {
  // Find or create user from Telegram data
  static async findOrCreateUser(telegramData: any) {
    const { id, username, first_name } = telegramData;

    let user = await db.user.findUnique({
      where: { telegramId: id }
    });

    if (!user) {
      user = await db.user.create({
        data: {
          telegramId: id,
          username: username || null,
          firstName: first_name
        }
      });
    } else {
      // Update user info if changed
      const updateData: any = { lastActive: new Date() };
      if (username && user.username !== username) {
        updateData.username = username;
      }
      if (first_name && user.firstName !== first_name) {
        updateData.firstName = first_name;
      }

      if (Object.keys(updateData).length > 1) {
        user = await db.user.update({
          where: { id: user.id },
          data: updateData
        });
      }
    }

    return user;
  }

  // Generate JWT token
  static generateToken(user: User) {
    const payload = {
      userId: user.id,
      telegramId: user.telegramId,
      firstName: user.firstName
    };

    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }

  // Verify JWT token
  static verifyToken(token: string) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as any;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Get user by ID
  static async findById(id: number) {
    return db.user.findUnique({
      where: { id }
    });
  }

  // Update user preferences
  static async updatePreferences(userId: number, preferences: UserPreferences) {
    return db.user.update({
      where: { id: userId },
      data: {
        notificationFrequency: preferences.notificationFrequency,
        maxNotificationsPerDay: preferences.maxNotificationsPerDay,
        dataRetention: preferences.dataRetention,
        analyticsOptIn: preferences.analyticsOptIn
      }
    });
  }

  // Get user preferences
  static async getPreferences(userId: number) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        notificationFrequency: true,
        maxNotificationsPerDay: true,
        dataRetention: true,
        analyticsOptIn: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      notificationFrequency: user.notificationFrequency,
      maxNotificationsPerDay: user.maxNotificationsPerDay,
      dataRetention: user.dataRetention,
      analyticsOptIn: user.analyticsOptIn
    };
  }

  // Delete user data (GDPR compliance)
  static async deleteUser(userId: number) {
    await db.user.delete({
      where: { id: userId }
    });
  }

  // Update last active timestamp
  static async updateLastActive(userId: number) {
    await db.user.update({
      where: { id: userId },
      data: { lastActive: new Date() }
    });
  }
}