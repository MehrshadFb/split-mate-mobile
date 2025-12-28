const cors = require('cors');
const config = require('../config');
const { getRateLimiter } = require('../config/upstash');

function configureCors() {
  const corsOptions = {
    origin: config.security.corsOrigins,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    maxAge: 86400, // 24 hours
  };
  return cors(corsOptions);
}

class InMemoryRateLimiter {
  constructor() {
    this.requests = new Map();
    setInterval(() => this._cleanup(), 60000); // Cleanup every minute
  }

  _getClientId(req) {
    return req.ip || req.connection.remoteAddress;
  }

  async limit(req, res, next) {
    const clientId = this._getClientId(req);
    const now = Date.now();
    const windowStart = now - config.security.rateLimitWindowMs;
    // Initialize request log for client
    if (!this.requests.has(clientId)) {
      this.requests.set(clientId, []);
    }
    // Filter requests within the time window
    const clientRequests = this.requests.get(clientId);
    const recentRequests = clientRequests.filter(timestamp => timestamp > windowStart);
    // Check if limit exceeded
    if (recentRequests.length >= config.security.rateLimitMaxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil(config.security.rateLimitWindowMs / 1000),
        },
      });
    }
    // Add current request
    recentRequests.push(now);
    this.requests.set(clientId, recentRequests);
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', config.security.rateLimitMaxRequests);
    res.setHeader('X-RateLimit-Remaining', config.security.rateLimitMaxRequests - recentRequests.length);
    res.setHeader('X-RateLimit-Reset', new Date(windowStart + config.security.rateLimitWindowMs).toISOString());
    next();
  }

  _cleanup() {
    const now = Date.now();
    const windowStart = now - config.security.rateLimitWindowMs;
    for (const [clientId, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(timestamp => timestamp > windowStart);
      // Remove client entry if no recent requests
      if (recentRequests.length === 0) {
        this.requests.delete(clientId);
      } else {
        this.requests.set(clientId, recentRequests);
      }
    }
  }
}

// Initialize rate limiters - Redis and In-Memory
const inMemoryRateLimiter = new InMemoryRateLimiter();
const upstashRateLimiter = getRateLimiter(
  config.security.rateLimitMaxRequests,
  config.security.rateLimitWindowMs
);

async function rateLimit(req, res, next) {
  const clientId = req.ip || req.connection.remoteAddress;
  // Try Upstash Redis-based rate limiting first
  if (upstashRateLimiter) {
    try {
      const { success, limit, remaining, reset } = await upstashRateLimiter.limit(clientId);
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', new Date(reset).toISOString());
      if (!success) {
        const retryAfter = Math.ceil((reset - Date.now()) / 1000);
        res.setHeader('Retry-After', retryAfter);
        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
            retryAfter,
          },
        });
      }
      return next();
    } catch (error) {
      console.error('Upstash rate limiting error, falling back to in-memory:', error.message);
    }
  }
  // Fallback to in-memory rate limiting
  return inMemoryRateLimiter.limit(req, res, next);
}

function securityHeaders(req, res, next) {
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}

module.exports = {
  configureCors,
  rateLimit,
  securityHeaders,
};
