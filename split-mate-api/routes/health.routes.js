const express = require('express');
const { getJobService } = require('../services/job.service');
const { checkRedisHealth, getRedisStats } = require('../config/upstash');
const { getGeminiService } = require('../services/gemini.service');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.get('/detailed', async (req, res) => {
  const jobService = getJobService();
  const geminiService = getGeminiService();
  const stats = jobService.getStats();
  const redisHealthy = await checkRedisHealth();
  const redisStats = await getRedisStats();
  const geminiHealth = await geminiService.checkHealth();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB',
    },
    jobs: stats,
    redis: {
      enabled: redisStats !== null,
      healthy: redisHealthy,
      type: redisStats ? 'Upstash Redis' : 'In-Memory',
    },
    gemini: {
      healthy: geminiHealth.healthy,
      model: geminiHealth.model,
      error: geminiHealth.error || undefined,
    },
  });
});

module.exports = router;
