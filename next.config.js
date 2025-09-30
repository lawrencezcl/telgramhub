/** @type {import('next').NextConfig} */
const nextConfig = {
  // Edge runtime configuration
  experimental: {
    runtime: 'edge',
  },

  // Image optimization for CDN
  images: {
    domains: ['t.me', 'cdn.telegram.org'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Performance optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Compression
  compress: true,

  // Static optimization
  trailingSlash: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        // Cache static assets
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache API responses
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=30',
          },
        ],
      },
    ];
  },

  // Redirects for better SEO
  async redirects() {
    return [
      {
        source: '/discover',
        destination: '/',
        permanent: true,
      },
      {
        source: '/channels',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Rewrites for API proxying
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/health',
          destination: '/api/health',
        },
      ],
    };
  },

  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Optimize for edge runtime
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          telegram: {
            test: /[\\/]node_modules[\\/](react-telegram|telegram-web-app)/,
            name: 'telegram',
            priority: -5,
            chunks: 'all',
          },
        },
      };
    }

    return config;
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
  },

  // Output configuration
  output: 'standalone',
  distDir: '.next',
};

module.exports = nextConfig;