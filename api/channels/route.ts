import { NextRequest, NextResponse } from 'next/server';
import { ChannelModel } from '@/lib/models/Channel';
import cache from '@/lib/utils/cache';
import performanceMonitor from '@/lib/utils/performance';

// Edge runtime configuration
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const timerKey = 'channels-get';
  performanceMonitor.startTimer(timerKey);

  try {
    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      category: searchParams.get('category'),
      minSubscribers: searchParams.get('minSubscribers'),
      maxSubscribers: searchParams.get('maxSubscribers'),
      language: searchParams.get('language'),
      activity: searchParams.get('activity') as 'low' | 'medium' | 'high' | undefined
    };

    // Check cache first
    const cachedChannels = await cache.getCachedChannels(params);
    if (cachedChannels) {
      performanceMonitor.endTimer(timerKey, true);
      return NextResponse.json(cachedChannels, {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=30',
          'X-Cache': 'HIT'
        }
      });
    }

    // Parse filters
    const filters: any = {};
    if (params.category) filters.category = params.category;
    if (params.language) filters.language = params.language;
    if (params.minSubscribers) {
      filters.minSubscribers = parseInt(params.minSubscribers);
    }
    if (params.maxSubscribers) {
      filters.maxSubscribers = parseInt(params.maxSubscribers);
    }
    if (params.activity) {
      filters.activity = params.activity;
    }

    const limit = parseInt(params.limit);
    const page = parseInt(params.page);
    const skip = (page - 1) * limit;

    // Fetch channels and total count in parallel
    const [channels, total] = await Promise.all([
      ChannelModel.findPopular(limit, filters),
      ChannelModel.countChannels(filters)
    ]);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      hasNext: skip + channels.length < total,
      hasPrev: page > 1
    };

    const result = {
      channels,
      pagination
    };

    // Cache the result
    await cache.cacheChannels(result, params);

    performanceMonitor.endTimer(timerKey, true);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=30',
        'X-Cache': 'MISS'
      }
    });

  } catch (error) {
    console.error('Error in GET /api/channels:', error);
    performanceMonitor.endTimer(timerKey, false);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}