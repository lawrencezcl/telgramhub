import { db } from '@/lib/db';
import { Channel, Prisma } from '@prisma/client';

export interface ChannelFilters {
  category?: string;
  minSubscribers?: number;
  maxSubscribers?: number;
  language?: string;
  activity?: 'low' | 'medium' | 'high';
}

export class ChannelModel {
  // Find popular channels with filtering
  static async findPopular(limit = 20, filters: ChannelFilters = {}) {
    const where: Prisma.ChannelWhereInput = {
      isActive: true,
      ...filters.category && { category: filters.category },
      ...filters.language && { language: filters.language },
      ...filters.minSubscribers && { subscriberCount: { gte: filters.minSubscribers } },
      ...filters.maxSubscribers && { subscriberCount: { lte: filters.maxSubscribers } },
      ...filters.activity && {
        postsPerDay: filters.activity === 'low' ? { lt: 1 } :
                      filters.activity === 'medium' ? { gte: 1, lte: 5 } :
                      { gt: 5 }
      }
    };

    const channels = await db.channel.findMany({
      where,
      orderBy: [
        { subscriberCount: 'desc' },
        { growthRate7d: 'desc' }
      ],
      take: limit,
      select: {
        id: true,
        telegramId: true,
        username: true,
        title: true,
        description: true,
        category: true,
        language: true,
        subscriberCount: true,
        growthRate7d: true,
        growthRate30d: true,
        postsPerDay: true,
        lastPostAt: true,
        engagementScore: true,
        tags: true,
        lastIndexed: true,
        isActive: true
      }
    });

    return channels.map(channel => ({
      ...channel,
      metrics: {
        subscriberCount: channel.subscriberCount,
        growthRate7d: channel.growthRate7d,
        growthRate30d: channel.growthRate30d,
        postsPerDay: channel.postsPerDay,
        lastPostAt: channel.lastPostAt,
        engagementScore: channel.engagementScore
      }
    }));
  }

  // Search channels with text search
  static async searchChannels(query: string, limit = 20, filters: ChannelFilters = {}) {
    const where: Prisma.ChannelWhereInput = {
      isActive: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query] } }
      ],
      ...filters.category && { category: filters.category },
      ...filters.language && { language: filters.language },
      ...filters.minSubscribers && { subscriberCount: { gte: filters.minSubscribers } },
      ...filters.maxSubscribers && { subscriberCount: { lte: filters.maxSubscribers } }
    };

    const channels = await db.channel.findMany({
      where,
      orderBy: [
        { subscriberCount: 'desc' },
        { growthRate7d: 'desc' }
      ],
      take: limit,
      select: {
        id: true,
        telegramId: true,
        username: true,
        title: true,
        description: true,
        category: true,
        language: true,
        subscriberCount: true,
        growthRate7d: true,
        growthRate30d: true,
        postsPerDay: true,
        lastPostAt: true,
        engagementScore: true,
        tags: true,
        lastIndexed: true,
        isActive: true
      }
    });

    return channels.map(channel => ({
      ...channel,
      metrics: {
        subscriberCount: channel.subscriberCount,
        growthRate7d: channel.growthRate7d,
        growthRate30d: channel.growthRate30d,
        postsPerDay: channel.postsPerDay,
        lastPostAt: channel.lastPostAt,
        engagementScore: channel.engagementScore
      }
    }));
  }

  // Find channels by category
  static async findByCategory(category: string, limit = 20) {
    const channels = await db.channel.findMany({
      where: { category, isActive: true },
      orderBy: { subscriberCount: 'desc' },
      take: limit,
      select: {
        id: true,
        telegramId: true,
        username: true,
        title: true,
        description: true,
        category: true,
        language: true,
        subscriberCount: true,
        growthRate7d: true,
        growthRate30d: true,
        postsPerDay: true,
        lastPostAt: true,
        engagementScore: true,
        tags: true,
        lastIndexed: true,
        isActive: true
      }
    });

    return channels.map(channel => ({
      ...channel,
      metrics: {
        subscriberCount: channel.subscriberCount,
        growthRate7d: channel.growthRate7d,
        growthRate30d: channel.growthRate30d,
        postsPerDay: channel.postsPerDay,
        lastPostAt: channel.lastPostAt,
        engagementScore: channel.engagementScore
      }
    }));
  }

  // Find channel by ID
  static async findById(id: string) {
    const channel = await db.channel.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        telegramId: true,
        username: true,
        title: true,
        description: true,
        category: true,
        language: true,
        subscriberCount: true,
        growthRate7d: true,
        growthRate30d: true,
        postsPerDay: true,
        lastPostAt: true,
        engagementScore: true,
        tags: true,
        lastIndexed: true,
        isActive: true
      }
    });

    if (!channel) return null;

    return {
      ...channel,
      metrics: {
        subscriberCount: channel.subscriberCount,
        growthRate7d: channel.growthRate7d,
        growthRate30d: channel.growthRate30d,
        postsPerDay: channel.postsPerDay,
        lastPostAt: channel.lastPostAt,
        engagementScore: channel.engagementScore
      }
    };
  }

  // Count channels with filters
  static async countChannels(filters: ChannelFilters = {}) {
    const where: Prisma.ChannelWhereInput = {
      isActive: true,
      ...filters.category && { category: filters.category },
      ...filters.language && { language: filters.language },
      ...filters.minSubscribers && { subscriberCount: { gte: filters.minSubscribers } },
      ...filters.maxSubscribers && { subscriberCount: { lte: filters.maxSubscribers } }
    };

    return db.channel.count({ where });
  }

  // Update channel metrics
  static async updateMetrics(id: string, metrics: Partial<Channel>) {
    return db.channel.update({
      where: { id: parseInt(id) },
      data: {
        ...metrics,
        lastIndexed: new Date()
      }
    });
  }

  // Create new channel
  static async create(channelData: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>) {
    return db.channel.create({
      data: channelData
    });
  }
}