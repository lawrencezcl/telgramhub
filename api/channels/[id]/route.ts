import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/utils/database';
import Channel from '@/lib/models/Channel';
import cache from '@/lib/utils/cache';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.connect();

    const { id } = params;

    // Check cache first
    const cachedChannel = await cache.getCachedChannelDetails(id);
    if (cachedChannel) {
      return NextResponse.json(cachedChannel, {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=60',
          'X-Cache': 'HIT'
        }
      });
    }

    const channel = await Channel.findById(id).lean().exec();

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }

    // Get similar channels based on category
    const similarChannels = await Channel.find({
      _id: { $ne: id },
      category: channel.category,
      isActive: true
    })
      .limit(5)
      .select('title username subscriberCount category')
      .lean()
      .exec();

    const result = {
      ...channel,
      recentPosts: [], // Mock data for now
      similarChannels
    };

    // Cache the result
    await cache.cacheChannelDetails(id, result);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=60',
        'X-Cache': 'MISS'
      }
    });

  } catch (error) {
    console.error('Error in GET /api/channels/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.connect();

    const { id } = params;

    const channel = await Channel.findById(id);
    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }

    if (!channel.isPublic) {
      return NextResponse.json(
        { error: 'Cannot join private channel' },
        { status: 400 }
      );
    }

    const joinLink = `https://t.me/${channel.username.replace('@', '')}`;

    const result = {
      joinLink,
      channelTitle: channel.title
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600', // 1 hour cache for join links
        'X-Cache': 'MISS'
      }
    });

  } catch (error) {
    console.error('Error in POST /api/channels/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}