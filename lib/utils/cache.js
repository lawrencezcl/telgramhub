// Edge runtime optimized caching using Vercel KV and memory cache
class EdgeCache {
  constructor() {
    this.memoryCache = new Map();
    this.ttlMap = new Map();

    // Cleanup interval for memory cache
    setInterval(() => {
      this.cleanupMemoryCache();
    }, 60000); // Clean every minute
  }

  // Memory cache for edge runtime
  setMemory(key, value, ttlSeconds = 300) {
    this.memoryCache.set(key, value);
    this.ttlMap.set(key, Date.now() + (ttlSeconds * 1000));
  }

  getMemory(key) {
    const ttl = this.ttlMap.get(key);
    if (ttl && Date.now() > ttl) {
      this.memoryCache.delete(key);
      this.ttlMap.delete(key);
      return null;
    }
    return this.memoryCache.get(key) || null;
  }

  cleanupMemoryCache() {
    const now = Date.now();
    for (const [key, ttl] of this.ttlMap.entries()) {
      if (now > ttl) {
        this.memoryCache.delete(key);
        this.ttlMap.delete(key);
      }
    }
  }

  // Generate cache keys with edge context
  generateKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join(':');

    return `${prefix}:${sortedParams}`;
  }

  // Cache channels for edge performance
  async cacheChannels(channels, params = {}) {
    const key = this.generateKey('channels', params);
    this.setMemory(key, channels, 600); // 10 minutes cache

    // Also cache in Vercel KV if available
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const response = await fetch(`${process.env.KV_REST_API_URL}/set/${key}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            value: JSON.stringify(channels),
            ex: 600 // 10 minutes
          })
        });
      } catch (error) {
        console.warn('KV cache error:', error);
      }
    }
  }

  // Get cached channels
  async getCachedChannels(params = {}) {
    const key = this.generateKey('channels', params);

    // Check memory cache first (fastest)
    let channels = this.getMemory(key);
    if (channels) {
      return channels;
    }

    // Check Vercel KV cache
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const response = await fetch(`${process.env.KV_REST_API_URL}/get/${key}`);
        if (response.ok) {
          const data = await response.json();
          channels = JSON.parse(data.result);
          this.setMemory(key, channels, 600); // Cache in memory too
          return channels;
        }
      } catch (error) {
        console.warn('KV cache error:', error);
      }
    }

    return null;
  }

  // Cache search results
  async cacheSearchResults(query, results, params = {}) {
    const key = this.generateKey('search', { q: query, ...params });
    this.setMemory(key, results, 300); // 5 minutes cache for search
  }

  async getCachedSearchResults(query, params = {}) {
    const key = this.generateKey('search', { q: query, ...params });
    return this.getMemory(key);
  }

  // Cache channel details
  async cacheChannelDetails(channelId, details) {
    const key = this.generateKey('channel', { id: channelId });
    this.setMemory(key, details, 900); // 15 minutes cache
  }

  async getCachedChannelDetails(channelId) {
    const key = this.generateKey('channel', { id: channelId });
    return this.getMemory(key);
  }

  // Invalidate cache
  invalidate(key) {
    this.memoryCache.delete(key);
    this.ttlMap.delete(key);
  }

  invalidatePattern(pattern) {
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
        this.ttlMap.delete(key);
      }
    }
  }
}

export default new EdgeCache();