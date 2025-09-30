# Tasks: Telegram Miniapp Channel Discovery

**Input**: Design documents from `/specs/001-telegram-miniapp-for/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `backend/src/`, `frontend/src/`
- Paths shown below follow plan.md web application structure

## Phase 3.1: Setup
- [x] T001 Create project structure per implementation plan (backend/ and frontend/ directories)
- [x] T002 Initialize Node.js backend with Express.js, MongoDB, Redis dependencies
- [x] T003 Initialize TypeScript frontend with React and Telegram Miniapp SDK
- [x] T004 [P] Configure ESLint and Prettier for backend code
- [x] T005 [P] Configure ESLint and Prettier for frontend code
- [x] T006 Set up environment configuration (.env files for both backend and frontend)
- [x] T007 [P] Configure Jest testing framework for backend
- [x] T008 [P] Configure Jest testing framework for frontend

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### API Contract Tests
- [x] T009 [P] Contract test GET /api/channels in backend/tests/contract/test_channels_get.js
- [ ] T010 [P] Contract test GET /api/channels/search in backend/tests/contract/test_channels_search.js
- [ ] T011 [P] Contract test GET /api/channels/{id} in backend/tests/contract/test_channel_detail.js
- [ ] T012 [P] Contract test POST /api/channels/{id}/join in backend/tests/contract/test_channel_join.js
- [ ] T013 [P] Contract test GET /api/subscriptions in backend/tests/contract/test_subscriptions_get.js
- [x] T014 [P] Contract test POST /api/subscriptions in backend/tests/contract/test_subscription_create.js
- [ ] T015 [P] Contract test PUT /api/subscriptions/{id} in backend/tests/contract/test_subscription_update.js
- [ ] T016 [P] Contract test DELETE /api/subscriptions/{id} in backend/tests/contract/test_subscription_delete.js
- [ ] T017 [P] Contract test GET /api/notifications in backend/tests/contract/test_notifications_get.js
- [ ] T018 [P] Contract test PUT /api/notifications in backend/tests/contract/test_notifications_read.js
- [ ] T019 [P] Contract test GET /api/users/preferences in backend/tests/contract/test_preferences_get.js
- [ ] T020 [P] Contract test PUT /api/users/preferences in backend/tests/contract/test_preferences_update.js

### Integration Tests
- [x] T021 [P] Integration test channel discovery workflow in backend/tests/integration/test_channel_discovery.js
- [ ] T022 [P] Integration test keyword subscription workflow in backend/tests/integration/test_keyword_subscription.js
- [ ] T023 [P] Integration test notification delivery in backend/tests/integration/test_notification_delivery.js
- [ ] T024 [P] Integration test user authentication via Telegram in backend/tests/integration/test_telegram_auth.js
- [ ] T025 [P] Integration test bot command handling in backend/tests/integration/test_bot_commands.js

### Frontend Tests
- [ ] T026 [P] Component test ChannelCard in frontend/tests/components/ChannelCard.test.tsx
- [ ] T027 [P] Component test SearchBar in frontend/tests/components/SearchBar.test.tsx
- [ ] T028 [P] Component test FilterPanel in frontend/tests/components/FilterPanel.test.tsx
- [ ] T029 [P] Component test Dashboard in frontend/tests/pages/Dashboard.test.tsx
- [ ] T030 [P] Component test ChannelDetails in frontend/tests/pages/ChannelDetails.test.tsx

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Backend Models
- [x] T031 [P] User model in backend/src/models/user.js
- [x] T032 [P] Channel model in backend/src/models/channel.js
- [x] T033 [P] KeywordSubscription model in backend/src/models/keywordSubscription.js
- [ ] T034 [P] Notification model in backend/src/models/notification.js
- [ ] T035 [P] ChannelCategory model in backend/src/models/channelCategory.js

### Backend Services
- [x] T036 [P] UserService CRUD in backend/src/services/userService.js
- [ ] T037 [P] ChannelService discovery and metrics in backend/src/services/channelService.js
- [ ] T038 [P] SubscriptionService keyword management in backend/src/services/subscriptionService.js
- [ ] T039 [P] NotificationService delivery system in backend/src/services/notificationService.js
- [ ] T040 [P] TelegramService API integration in backend/src/services/telegramService.js

### Backend API Endpoints
- [x] T041 GET /api/channels endpoint with filtering and pagination
- [x] T042 GET /api/channels/search endpoint with text search
- [x] T043 GET /api/channels/{id} endpoint for channel details
- [x] T044 POST /api/channels/{id}/join endpoint for join link generation
- [ ] T045 GET /api/subscriptions endpoint for user subscriptions
- [ ] T046 POST /api/subscriptions endpoint for creating subscriptions
- [ ] T047 PUT /api/subscriptions/{id} endpoint for updating subscriptions
- [ ] T048 DELETE /api/subscriptions/{id} endpoint for deleting subscriptions
- [ ] T049 GET /api/notifications endpoint for user notifications
- [ ] T050 PUT /api/notifications endpoint for marking notifications read
- [ ] T051 GET /api/users/preferences endpoint for user preferences
- [ ] T052 PUT /api/users/preferences endpoint for updating preferences

### Bot Implementation
- [ ] T053 [P] Bot command handlers in backend/src/bot/handlers/
- [ ] T054 [P] Bot webhook setup and middleware in backend/src/bot/webhook.js
- [ ] T055 [P] Inline mode query handling in backend/src/bot/inline.js
- [ ] T056 [P] Callback data handling for interactive buttons in backend/src/bot/callbacks.js

### Frontend Components
- [ ] T057 [P] ChannelCard component in frontend/src/components/ChannelCard.tsx
- [ ] T058 [P] SearchBar component in frontend/src/components/SearchBar.tsx
- [ ] T059 [P] FilterPanel component in frontend/src/components/FilterPanel.tsx
- [ ] T060 [P] NotificationSettings component in frontend/src/components/NotificationSettings.tsx
- [ ] T061 [P] Dashboard page in frontend/src/pages/Dashboard.tsx
- [ ] T062 [P] ChannelDetails page in frontend/src/pages/ChannelDetails.tsx
- [ ] T063 [P] SearchResults page in frontend/src/pages/SearchResults.tsx

### Frontend Services
- [ ] T064 [P] API service in frontend/src/services/api.ts
- [ ] T065 [P] Telegram WebApp integration in frontend/src/services/telegram.ts
- [ ] T066 [P] State management with Context/Redux in frontend/src/store/

## Phase 3.4: Integration
- [x] T067 Connect models to MongoDB with proper indexes
- [x] T068 Redis integration for caching and real-time notifications
- [ ] T069 JWT authentication middleware for API endpoints
- [x] T070 Telegram WebApp authentication flow
- [x] T071 Request/response logging and error handling middleware
- [x] T072 Rate limiting middleware for API protection
- [x] T073 CORS and security headers configuration
- [ ] T074 WebSocket implementation for real-time notifications
- [ ] T075 Background job system for channel data updates
- [ ] T076 Telegram Bot API webhook configuration
- [x] T077 Adapt project structure for Vercel edge runtime
- [x] T078 Convert backend to serverless API routes
- [x] T079 Optimize database connections for edge runtime
- [x] T080 Implement edge-optimized caching strategy
- [x] T081 Configure Vercel deployment settings
- [x] T082 Update frontend for Vercel deployment
- [x] T083 Add performance optimizations for CDN

## Phase 3.5: Polish
- [ ] T077 [P] Unit tests for validation logic in backend/tests/unit/test_validation.js
- [ ] T078 [P] Unit tests for business logic in backend/tests/unit/test_services.js
- [ ] T079 [P] Unit tests for utility functions in backend/tests/unit/test_utils.js
- [ ] T080 Performance tests for API responses (<500ms)
- [ ] T081 Performance tests for miniapp loading (<2s)
- [ ] T082 [P] Update API documentation with examples
- [ ] T083 [P] Create deployment documentation
- [ ] T084 [P] Create user guide for bot commands
- [ ] T085 [P] Create privacy policy and terms of service
- [ ] T086 Remove code duplication and optimize queries
- [ ] T087 Implement comprehensive error handling
- [ ] T088 Add monitoring and alerting
- [ ] T089 Security audit and penetration testing
- [ ] T090 Run end-to-end testing from quickstart.md scenarios

## Dependencies
- Setup tasks (T001-T008) before all other phases
- Contract tests (T009-T020) must run and fail before implementation (T031-T076)
- Model tasks (T031-T035) before service tasks (T036-T040)
- Service tasks before API endpoints (T041-T052)
- Bot and frontend can run in parallel after core services
- Integration tasks (T067-T076) after core implementation
- Polish tasks (T077-T090) after all integration complete

## Parallel Execution Examples

### Contract Tests (Phase 3.2)
```
# Launch T009-T020 together (12 parallel tasks):
Task: "Contract test GET /api/channels in backend/tests/contract/test_channels_get.js"
Task: "Contract test GET /api/channels/search in backend/tests/contract/test_channels_search.js"
Task: "Contract test GET /api/channels/{id} in backend/tests/contract/test_channel_detail.js"
Task: "Contract test POST /api/channels/{id}/join in backend/tests/contract/test_channel_join.js"
Task: "Contract test GET /api/subscriptions in backend/tests/contract/test_subscriptions_get.js"
Task: "Contract test POST /api/subscriptions in backend/tests/contract/test_subscription_create.js"
Task: "Contract test PUT /api/subscriptions/{id} in backend/tests/contract/test_subscription_update.js"
Task: "Contract test DELETE /api/subscriptions/{id} in backend/tests/contract/test_subscription_delete.js"
Task: "Contract test GET /api/notifications in backend/tests/contract/test_notifications_get.js"
Task: "Contract test PUT /api/notifications in backend/tests/contract/test_notifications_read.js"
Task: "Contract test GET /api/users/preferences in backend/tests/contract/test_preferences_get.js"
Task: "Contract test PUT /api/users/preferences in backend/tests/contract/test_preferences_update.js"
```

### Model Creation (Phase 3.3)
```
# Launch T031-T035 together (5 parallel tasks):
Task: "User model in backend/src/models/user.js"
Task: "Channel model in backend/src/models/channel.js"
Task: "KeywordSubscription model in backend/src/models/keywordSubscription.js"
Task: "Notification model in backend/src/models/notification.js"
Task: "ChannelCategory model in backend/src/models/channelCategory.js"
```

### Service Layer (Phase 3.3)
```
# Launch T036-T040 together (5 parallel tasks):
Task: "UserService CRUD in backend/src/services/userService.js"
Task: "ChannelService discovery and metrics in backend/src/services/channelService.js"
Task: "SubscriptionService keyword management in backend/src/services/subscriptionService.js"
Task: "NotificationService delivery system in backend/src/services/notificationService.js"
Task: "TelegramService API integration in backend/src/services/telegramService.js"
```

### Frontend Components (Phase 3.3)
```
# Launch T057-T066 together (10 parallel tasks):
Task: "ChannelCard component in frontend/src/components/ChannelCard.tsx"
Task: "SearchBar component in frontend/src/components/SearchBar.tsx"
Task: "FilterPanel component in frontend/src/components/FilterPanel.tsx"
Task: "NotificationSettings component in frontend/src/components/NotificationSettings.tsx"
Task: "Dashboard page in frontend/src/pages/Dashboard.tsx"
Task: "ChannelDetails page in frontend/src/pages/ChannelDetails.tsx"
Task: "SearchResults page in frontend/src/pages/SearchResults.tsx"
Task: "API service in frontend/src/services/api.ts"
Task: "Telegram WebApp integration in frontend/src/services/telegram.ts"
Task: "State management with Context/Redux in frontend/src/store/"
```

## Notes
- [P] tasks = different files, no dependencies between them
- Verify tests fail before implementing corresponding functionality
- Commit after each task for proper version control
- Each task specifies exact file paths for clarity
- No task modifies the same file as another [P] task
- Follow TDD principles: Red (failing test) → Green (passing test) → Refactor

## Validation Checklist
*GATE: Checked by main() during execution*

- [x] All contracts have corresponding tests (3 contract files → 12 contract tests)
- [x] All entities have model tasks (5 entities → 5 model tasks)
- [x] All tests come before implementation
- [x] Parallel tasks are truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Tasks cover all user stories from specification
- [x] Include setup, integration, and polish phases
- [x] Dependencies properly defined
- [x] Ready for immediate execution