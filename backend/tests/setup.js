require('dotenv').config();

// Mock Telegram Bot API for testing
jest.mock('node-telegram-bot-api', () => {
  return jest.fn().mockImplementation(() => ({
    sendMessage: jest.fn(),
    setWebHook: jest.fn(),
    getUpdates: jest.fn(),
    onText: jest.fn(),
    onCallbackQuery: jest.fn(),
    answerInlineQuery: jest.fn(),
  }));
});

// Global test timeout
jest.setTimeout(10000);