import mongoose from 'mongoose';

// Edge runtime database connection manager
class DatabaseConnection {
  constructor() {
    this.cached = global.mongoose || null;
    if (process.env.NODE_ENV === 'development') {
      global.mongoose = this.cached;
    }
  }

  async connect() {
    if (this.cached) {
      return this.cached;
    }

    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        // Edge runtime optimized settings
        maxPoolSize: 1,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        bufferCommands: false,
      });

      this.cached = conn;

      if (process.env.NODE_ENV === 'development') {
        global.mongoose = conn;
      }

      return conn;
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.cached) {
      await mongoose.disconnect();
      this.cached = null;
      if (process.env.NODE_ENV === 'development') {
        global.mongoose = null;
      }
    }
  }
}

export default new DatabaseConnection();