# Data Model

## Core Entities

### User
```javascript
{
  _id: ObjectId,
  telegramId: Number,        // Telegram user ID
  username: String,          // Telegram username (optional)
  firstName: String,         // Telegram first name
  notificationPreferences: {
    frequency: String,       // 'immediate', 'daily', 'weekly'
    maxPerDay: Number,       // Maximum notifications per day
    keywords: [String]       // Subscribed keywords
  },
  privacy: {
    dataRetention: String,   // '30days', '90days', 'indefinite'
    analyticsOptIn: Boolean  // Allow anonymous usage analytics
  },
  createdAt: Date,
  updatedAt: Date,
  lastActive: Date
}
```

### Channel
```javascript
{
  _id: ObjectId,
  telegramId: Number,        // Telegram channel ID
  username: String,          // Channel username (@channel)
  title: String,             // Channel title
  description: String,       // Channel description
  category: String,          // Detected/assigned category
  language: String,          // Primary language (detected)
  isPublic: Boolean,         // Public channel status
  metrics: {
    subscriberCount: Number, // Current subscriber count
    growthRate7d: Number,    // 7-day growth percentage
    growthRate30d: Number,   // 30-day growth percentage
    postsPerDay: Number,     // Average posts per day
    lastPostAt: Date,        // Last post timestamp
    engagementScore: Number  // Calculated engagement score
  },
  tags: [String],           // Auto-generated tags from description
  lastIndexed: Date,        // Last data update
  isActive: Boolean,        // Channel still active
  createdAt: Date,
  updatedAt: Date
}
```

### KeywordSubscription
```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // Reference to User
  keyword: String,           // Subscribed keyword
  filters: {
    categories: [String],    // Preferred categories for this keyword
    minSubscribers: Number,  // Minimum subscriber count
    languages: [String]      // Preferred languages
  },
  isActive: Boolean,         // Subscription active
  matchedChannels: [ObjectId], // Recently matched channels
  lastNotificationAt: Date,  // Last notification sent
  createdAt: Date,
  updatedAt: Date
}
```

### Notification
```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // Target user
  type: String,              // 'new_channel', 'trending', 'keyword_match'
  title: String,             // Notification title
  message: String,           // Notification message
  channelId: ObjectId,       // Related channel (if applicable)
  keyword: String,           // Matched keyword (if applicable)
  priority: String,          // 'low', 'medium', 'high'
  isRead: Boolean,           // Read status
  sentVia: String,           // 'bot', 'miniapp'
  createdAt: Date,
  readAt: Date
}
```

### ChannelCategory
```javascript
{
  _id: ObjectId,
  name: String,              // Category name
  description: String,       // Category description
  keywords: [String],        // Associated keywords
  isActive: Boolean,
  sortOrder: Number,         // Display order
  createdAt: Date,
  updatedAt: Date
}
```

## Relationships

- User → KeywordSubscription (1:N)
- User → Notification (1:N)
- Channel → Notification (1:N)
- ChannelCategory → Channel (1:N)
- KeywordSubscription → Channel (N:M via matchedChannels)

## Indexes

### User Collection
- `telegramId` (unique)
- `lastActive` (TTL for inactive users)

### Channel Collection
- `telegramId` (unique)
- `category` + `isActive`
- `metrics.subscriberCount` (descending)
- `metrics.growthRate7d` (descending)
- `tags` (multikey)
- `lastIndexed` (TTL for updates)

### KeywordSubscription Collection
- `userId` + `keyword` (unique)
- `keyword` + `isActive`

### Notification Collection
- `userId` + `createdAt` (descending)
- `isRead` + `createdAt`

## Data Validation Rules

### User
- `telegramId` required and unique
- `notificationPreferences.frequency` in ['immediate', 'daily', 'weekly']
- `notificationPreferences.maxPerDay` between 1 and 50

### Channel
- `telegramId` required and unique
- `category` must exist in ChannelCategory
- `metrics.subscriberCount` >= 0
- `metrics.growthRate7d` can be negative (declining channels)

### KeywordSubscription
- `keyword` length between 2 and 50 characters
- `userId` must reference valid User
- `filters.minSubscribers` >= 0

## Data Lifecycle

### Channel Data Updates
- Popular channels: Update every 6 hours
- Regular channels: Update every 24 hours
- Inactive channels: Mark inactive after 7 days no posts
- Delete channels: Remove after 30 days inactive

### User Data Retention
- Inactive users: Mark after 90 days
- Data deletion: Complete removal upon user request
- Analytics data: Anonymized after 30 days

### Notification Cleanup
- Read notifications: Delete after 7 days
- Unread notifications: Delete after 30 days
- Delivery failures: Remove after 3 retry attempts