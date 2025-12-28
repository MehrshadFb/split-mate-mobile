const { Redis } = require('@upstash/redis');
const { Ratelimit } = require('@upstash/ratelimit');

let redisClient = null;
let rateLimiter = null;

function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!upstashUrl || !upstashToken) {
    return null;
  }
  try {
    redisClient = new Redis({
      url: upstashUrl,
      token: upstashToken,
    });
    return redisClient;
  } catch (error) {
    return null;
  }
}

function getRateLimiter(maxRequests, windowMs) {
  if (rateLimiter) {
    return rateLimiter;
  }
  const redis = getRedisClient();
  if (!redis) {
    return null;
  }
  try {
    const windowSeconds = Math.floor(windowMs / 1000);
    rateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
      analytics: true,
      prefix: 'splitmate:ratelimit',
    });
    return rateLimiter;
  } catch (error) {
    return null;
  }
}

async function checkRedisHealth() {
  const redis = getRedisClient();
  if (!redis) {
    return false;
  }
  try {
    await redis.ping();
    return true;
  } catch (error) {
    return false;
  }
}

async function getRedisStats() {
  const redis = getRedisClient();
  if (!redis) {
    return null;
  }
  try {
    const info = await redis.info();
    return {
      connected: true,
      info: info || 'Stats available',
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
    };
  }
}

module.exports = {
  getRedisClient,
  getRateLimiter,
  checkRedisHealth,
  getRedisStats,
};
