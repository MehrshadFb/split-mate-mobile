function validateEnvironment() {
  const required = ['GEMINI_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

function getInt(value, fallback) {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

const config = {
  server: {
    port: getInt(process.env.PORT, 3000),
    environment: process.env.NODE_ENV || 'development',
  },
  upload: {
    maxFileSizeMB: getInt(process.env.MAX_FILE_SIZE_MB, 10),
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    maxRetries: getInt(process.env.MAX_GEMINI_RETRIES, 3),
    timeoutMs: getInt(process.env.GEMINI_TIMEOUT_MS, 30000),
    retryDelayMs: getInt(process.env.RETRY_DELAY_MS, 1000),
    retryFactor: 2,
  },
  jobs: {
    maxStoredJobs: getInt(process.env.MAX_STORED_JOBS, 1000),
    jobExpirationMs: getInt(process.env.JOB_EXPIRATION_MS, 3600000), // 1 hour default
  },
  redis: {
    upstashUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    enabled: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
  },
  security: {
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
    rateLimitWindowMs: getInt(process.env.RATE_LIMIT_WINDOW_MS, 60000),
    rateLimitMaxRequests: getInt(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
  },
};

if (config.server.environment === 'production') {
  validateEnvironment();
}

module.exports = config;
