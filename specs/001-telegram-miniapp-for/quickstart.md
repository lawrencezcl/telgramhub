# TelgramHub Quickstart Guide

## Prerequisites

- Node.js 18+
- MongoDB 5.0+
- Redis 6.0+
- Telegram Bot Token
- Telegram Miniapp credentials

## Setup Instructions

### 1. Environment Configuration

Create `.env` file:
```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/telgramhub
REDIS_URL=redis://localhost:6379

# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBHOOK_URL=https://your-domain.com/webhook

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# App Configuration
NODE_ENV=development
PORT=3000
MINIAPP_URL=https://your-domain.com/miniapp

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Data Collection
CHANNEL_UPDATE_INTERVAL_HOURS=6
POPULAR_CHANNELS_THRESHOLD=1000
```

### 2. Database Setup

```bash
# Start MongoDB
mongod --dbpath /data/db

# Start Redis
redis-server

# Create indexes
npm run db:index
```

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Initialize Database

```bash
# Seed channel categories
npm run db:seed:categories

# Import initial popular channels (optional)
npm run db:seed:channels
```

### 5. Start Services

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## Bot Setup

### 1. Register Bot with Telegram
1. Contact @BotFather on Telegram
2. Create new bot with `/newbot`
3. Set bot description and commands
4. Enable inline mode if desired
5. Set privacy mode to allow message access

### 2. Configure Webhook
```bash
curl -X POST https://api.telegram.org/bot{BOT_TOKEN}/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/webhook"}'
```

### 3. Test Bot Commands
Send `/start` to your bot to verify setup

## Miniapp Development

### 1. Telegram Miniapp Configuration
1. Create miniapp via @BotFather
2. Set miniapp URL to your deployed frontend
3. Configure user data access permissions

### 2. Frontend Development
```bash
cd frontend
npm run dev  # Development server
npm run build  # Production build
```

### 3. Miniapp Integration
```typescript
// Initialize Telegram WebApp
const webApp = window.Telegram.WebApp;
webApp.ready();
webApp.expand();

// Get user data
const user = webApp.initDataUnsafe?.user;
const telegramId = user?.id;
```

## API Testing

### 1. Authentication
```bash
# Get JWT token (via miniapp or bot)
curl -X POST http://localhost:3000/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"telegramId": 123456789, "initData": "..."}'
```

### 2. Test Channel Discovery
```bash
# Get popular channels
curl -H "Authorization: Bearer {JWT_TOKEN}" \
  http://localhost:3000/api/channels?limit=10

# Search channels
curl -H "Authorization: Bearer {JWT_TOKEN}" \
  "http://localhost:3000/api/channels/search?q=technology"
```

### 3. Test Subscriptions
```bash
# Create subscription
curl -X POST \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"keyword": "blockchain"}' \
  http://localhost:3000/api/subscriptions
```

## Monitoring

### 1. Health Checks
```bash
# API health
curl http://localhost:3000/health

# Database health
curl http://localhost:3000/health/db
```

### 2. Logs
```bash
# Application logs
tail -f logs/app.log

# Error logs
tail -f logs/error.log
```

### 3. Metrics
- Prometheus metrics available at `/metrics`
- Custom dashboard for Telegram API usage
- Rate limiting monitoring

## Deployment

### 1. Production Environment
```bash
# Build for production
npm run build

# Set production variables
export NODE_ENV=production

# Start with PM2
pm2 start ecosystem.config.js
```

### 2. Docker Deployment
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d
```

### 3. SSL/TLS Configuration
- Configure valid SSL certificate
- Set up HTTPS redirect
- Update Telegram webhook URL

## Troubleshooting

### Common Issues

1. **Bot Not Responding**
   - Check webhook configuration
   - Verify bot token is correct
   - Check server logs for errors

2. **Miniapp Not Loading**
   - Verify miniapp URL is accessible
   - Check CORS configuration
   - Ensure HTTPS is properly configured

3. **Database Connection Issues**
   - Verify MongoDB and Redis are running
   - Check connection strings in .env
   - Review firewall rules

4. **Rate Limiting**
   - Monitor Telegram API usage
   - Adjust rate limiting settings
   - Implement proper caching

### Debug Mode
```bash
# Enable debug logging
DEBUG=telgramhub:* npm run dev
```

## Support

- Documentation: `/docs`
- API Reference: `/docs/api`
- Bot Commands: `/docs/bot`
- Issues: GitHub Issues