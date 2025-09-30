# Research Findings

## Clarification Resolutions

### FR-003: Channel Filters Available
**Decision**: Support the following filter types:
- Category/Topic (Technology, Entertainment, Education, News, etc.)
- Subscriber count ranges (<1K, 1K-10K, 10K-100K, 100K+)
- Language (based on channel description language detection)
- Activity level (posts per day: Low <1, Medium 1-5, High 5+)
- Growth rate (subscriber change over 30 days)

**Rationale**: These filters provide the most relevant discovery criteria for users while being implementable with available public data.

### FR-004: Channel Popularity Metrics
**Decision**: Track the following popularity metrics:
- Subscriber count (absolute number)
- Growth rate (percentage change over 7/30 days)
- Post frequency (average posts per day)
- Engagement rate (approximate based on public metrics when available)
- Recency (last post timestamp)

**Rationale**: Multi-factor popularity ranking provides more accurate and useful recommendations than subscriber count alone.

## Technology Stack Decisions

### Backend Framework: Node.js + Express.js
**Decision**: Node.js with Express.js framework
**Rationale**:
- Excellent Telegram Bot API support
- Rich ecosystem for real-time applications
- Good MongoDB/Redis integration
- TypeScript support for type safety

### Database: MongoDB + Redis
**Decision**: MongoDB for primary storage, Redis for caching
**Rationale**:
- MongoDB: Flexible schema for varied channel data
- Redis: High-performance caching for popularity metrics and real-time notifications

### Frontend: TypeScript + React
**Decision**: TypeScript with React for miniapp
**Rationale**:
- Telegram Miniapp SDK works well with React
- TypeScript provides type safety for API interactions
- Good component ecosystem for UI development

## Integration Patterns

### Telegram Bot API Integration
**Pattern**: Use official telegram-bot-api library with rate limiting
**Considerations**:
- Implement exponential backoff for rate limits
- Cache public channel data to reduce API calls
- Use webhooks for real-time updates

### Miniapp Integration
**Pattern**: Use Telegram Miniapp SDK with secure data passing
**Considerations**:
- Initialize with user context from Telegram
- Secure API communication with JWT tokens
- Offline support for cached channel data

## Data Privacy Implementation

### GDPR Compliance
**Approach**: Privacy by design
- Minimal data collection (only subscriptions and preferences)
- Right to deletion via bot commands
- Data encryption at rest and in transit
- Clear privacy policy in miniapp

### Data Retention
**Policy**:
- User subscriptions: Retain until user deletion
- Channel data: Refresh every 24 hours, purge inactive channels after 30 days
- Notifications: No long-term storage, sent immediately

## Performance Optimizations

### Caching Strategy
- Redis cache for popular channels (TTL: 1 hour)
- CDN for static miniapp assets
- Database indexing on search terms and categories

### Real-time Features
- WebSocket connections for instant notifications
- Background jobs for popularity metric calculations
- Efficient batch processing for keyword matching