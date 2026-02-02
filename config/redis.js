const Redis = require('ioredis');

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  lazyConnect: true,
};

// Create Redis client
const redis = new Redis(redisConfig);

// Connection event handlers
redis.on('connect', () => {
  console.log(' Redis Connected Successfully!');
});

redis.on('error', (err) => {
  console.error('Redis Connection Error:', err.message);
});

// Cache utility functions
const cache = {
  // Get cached data
  async get(key) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error('Redis GET Error:', err.message);
      return null;
    }
  },

  // Set cached data with expiration (default 5 minutes)
  async set(key, data, ttl = 300) {
    try {
      await redis.setex(key, ttl, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error('Redis SET Error:', err.message);
      return false;
    }
  },

  // Delete cached data
  async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (err) {
      console.error('Redis DEL Error:', err.message);
      return false;
    }
  },

  // Delete all keys matching pattern
  async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (err) {
      console.error('Redis DEL Pattern Error:', err.message);
      return false;
    }
  },

  // Check if connected
  async isConnected() {
    try {
      await redis.ping();
      return true;
    } catch {
      return false;
    }
  }
};

module.exports = { redis, cache };