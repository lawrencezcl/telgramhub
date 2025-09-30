// Edge runtime performance monitoring utilities

interface PerformanceMetrics {
  apiResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private startTimes: Map<string, number> = new Map();

  // Start timing an operation
  startTimer(key: string): void {
    this.startTimes.set(key, Date.now());
  }

  // End timing and record metrics
  endTimer(key: string, success: boolean = true): number {
    const startTime = this.startTimes.get(key);
    if (!startTime) return 0;

    const duration = Date.now() - startTime;
    this.startTimes.delete(key);

    const current = this.metrics.get(key) || {
      apiResponseTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      memoryUsage: 0,
      cpuUsage: 0,
    };

    // Update moving averages
    current.apiResponseTime = this.updateMovingAverage(current.apiResponseTime, duration);
    current.errorRate = this.updateMovingAverage(current.errorRate, success ? 0 : 100);

    this.metrics.set(key, current);
    return duration;
  }

  // Get performance metrics for analytics
  getMetrics(): PerformanceMetrics {
    const globalMetrics: PerformanceMetrics = {
      apiResponseTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      memoryUsage: 0,
      cpuUsage: 0,
    };

    if (this.metrics.size === 0) return globalMetrics;

    let totalResponseTime = 0;
    let totalErrorRate = 0;
    let totalCacheHitRate = 0;

    for (const [, metrics] of this.metrics) {
      totalResponseTime += metrics.apiResponseTime;
      totalErrorRate += metrics.errorRate;
      totalCacheHitRate += metrics.cacheHitRate;
    }

    const count = this.metrics.size;
    globalMetrics.apiResponseTime = totalResponseTime / count;
    globalMetrics.errorRate = totalErrorRate / count;
    globalMetrics.cacheHitRate = totalCacheHitRate / count;

    return globalMetrics;
  }

  // Update moving average (for runtime metrics)
  private updateMovingAverage(current: number, newValue: number, alpha: number = 0.1): number {
    return current === 0 ? newValue : current * (1 - alpha) + newValue * alpha;
  }

  // Log performance warnings
  checkPerformanceWarnings(): void {
    const metrics = this.getMetrics();

    if (metrics.apiResponseTime > 500) {
      console.warn(`High API response time: ${metrics.apiResponseTime.toFixed(2)}ms`);
    }

    if (metrics.errorRate > 5) {
      console.warn(`High error rate: ${metrics.errorRate.toFixed(2)}%`);
    }

    if (metrics.cacheHitRate < 50 && metrics.cacheHitRate > 0) {
      console.warn(`Low cache hit rate: ${metrics.cacheHitRate.toFixed(2)}%`);
    }
  }
}

// Edge runtime optimization utilities
export class EdgeOptimizer {
  // Optimize image loading for edge runtime
  static optimizeImage(src: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
  } = {}): string {
    const { width, height, quality = 80, format = 'webp' } = options;

    // Use Vercel's image optimization API
    if (src.startsWith('/')) {
      const params = new URLSearchParams();
      if (width) params.append('w', width.toString());
      if (height) params.append('h', height.toString());
      params.append('q', quality.toString());
      params.append('f', format);

      return `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`;
    }

    return src;
  }

  // Generate edge-optimized cache headers
  static getCacheHeaders(options: {
    maxAge?: number;
    staleWhileRevalidate?: number;
    isPublic?: boolean;
  } = {}): Record<string, string> {
    const {
      maxAge = 300, // 5 minutes default
      staleWhileRevalidate = 60,
      isPublic = true
    } = options;

    const cacheControl = [
      isPublic ? 'public' : 'private',
      `s-maxage=${maxAge}`,
      `stale-while-revalidate=${staleWhileRevalidate}`,
      'must-revalidate'
    ];

    return {
      'Cache-Control': cacheControl.join(', '),
      'CDN-Cache-Control': cacheControl.join(', '),
      'Vercel-CDN-Cache-Control': cacheControl.join(', ')
    };
  }

  // Generate edge-optimized CORS headers
  static getCorsHeaders(): Record<string, string> {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400', // 24 hours
    };
  }

  // Compress JSON responses for edge runtime
  static compressJSON(data: any): string {
    return JSON.stringify(data);
  }

  // Generate ETag for edge caching
  static generateETag(data: any): string {
    const hash = this.simpleHash(JSON.stringify(data));
    return `"${hash}"`;
  }

  // Simple hash function for ETag generation
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

// Real User Monitoring (RUM) for edge runtime
export class EdgeRUM {
  private static performanceObserver: PerformanceObserver | null = null;

  // Initialize RUM collection
  static init(): void {
    if (typeof window === 'undefined') return;

    // Monitor performance metrics
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.sendMetric('performance', {
            name: entry.name,
            value: entry.duration,
            type: entry.entryType,
            startTime: entry.startTime
          });
        }
      });

      this.performanceObserver.observe({
        entryTypes: ['navigation', 'resource', 'measure', 'paint']
      });
    }

    // Monitor errors
    window.addEventListener('error', (event) => {
      this.sendMetric('error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.sendMetric('promise-rejection', {
        reason: event.reason
      });
    });
  }

  // Send metrics to analytics service
  private static sendMetric(type: string, data: any): void {
    // In production, send to your analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Vercel Analytics or custom endpoint
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          data,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(() => {
        // Silently ignore analytics errors
      });
    } else {
      console.log(`RUM ${type}:`, data);
    }
  }

  // Custom metric reporting
  static sendCustomMetric(name: string, value: number, tags?: Record<string, string>): void {
    this.sendMetric('custom', {
      name,
      value,
      tags
    });
  }
}

// Export singleton instances
export const performanceMonitor = new PerformanceMonitor();

// Initialize RUM on client side
if (typeof window !== 'undefined') {
  EdgeRUM.init();
}