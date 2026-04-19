const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Main Redis client for application data
const redisClient = new Redis(redisUrl);

// Separate clients for Socket.io adapter (pub/sub requires dedicated connections)
const pubClient = new Redis(redisUrl);
const subClient = new Redis(redisUrl);

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

module.exports = {
  redisClient,
  pubClient,
  subClient
};
