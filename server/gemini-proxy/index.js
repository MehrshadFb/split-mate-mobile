require('dotenv').config();
const express = require('express');
const config = require('./config');
const routes = require('./routes');
const {
  configureCors,
  rateLimit,
  securityHeaders,
} = require('./middleware/security.middleware');
const {
  errorHandler,
  notFoundHandler,
} = require('./middleware/error.middleware');

const app = express();
// Trust proxy settings
app.set('trust proxy', 1); 
// Security middleware
app.use(securityHeaders);
app.use(configureCors());
// Request parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
// Apply rate limiting
app.use(rateLimit);
// Mount routes
app.use('/', routes);
// 404 handler
app.use(notFoundHandler);
// Global error handler
app.use(errorHandler);

function startServer() {
  // Start the server
  const server = app.listen(config.server.port, () => {
    console.log('Gemini Proxy Server Started');
    console.log('================================');
    console.log(`   Port: ${config.server.port}`);
    console.log(`   Environment: ${config.server.environment}`);
    console.log(`   Gemini Model: ${config.gemini.model}`);
    console.log(`   Max Retries: ${config.gemini.maxRetries}`);
    console.log(`   Timeout: ${config.gemini.timeoutMs}ms`);
    console.log(`   Max File Size: ${config.upload.maxFileSizeMB}MB`);
    console.log(`   Rate Limiting: ${config.redis.enabled ? 'Upstash Redis' : 'In-Memory'}`);
    console.log('================================');
  });
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
  process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = app;
