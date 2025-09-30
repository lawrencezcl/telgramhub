import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/utils/database';
import Channel from '@/lib/models/Channel';
import cache from '@/lib/utils/cache';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await db.connect();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const params = { q: query, page, limit };

    // Check cache first
    const cachedResults = await cache.getCachedSearchResults(query, params);
    if (cachedResults) {
      return NextResponse.json(cachedResults, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=30',
          'X-Cache': 'HIT'
        }
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [channels, total] = await Promise.all([
      Channel.searchChannels(query, parseInt(limit)),
      Channel.countDocuments({
        isActive: true,
        $text: { $search: query }
      })
    ]);

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      hasNext: skip + channels.length < total,
      hasPrev: parseInt(page) > 1
    };

    const result = {
      channels,
      pagination,
      searchQuery: query
    };

    // Cache search results
    await cache.cacheSearchResults(query, result, params);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=30',
        'X-Cache': 'MISS'
      }
    });

  } catch (error) {
    console.error('Error in GET /api/channels/search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}