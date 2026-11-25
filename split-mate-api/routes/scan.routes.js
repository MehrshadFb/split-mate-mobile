const express = require('express');
const { asyncHandler } = require('../middleware/error.middleware');
const upload = require('../middleware/upload.middleware');
const { validateFile, validateScanJobId } = require('../utils/validators');
const { getJobService } = require('../services/job.service');
const { getGeminiService } = require('../services/gemini.service');

const router = express.Router();

let isFirstScanOnInstance = true; // The first scan on a new server instance also pays for its startup

function appBuild(userAgent) {
  const match = /SplitMate\/(\S+)/.exec(userAgent || '');
  return match ? match[1] : 'unknown';
}

router.post(
  '/',
  (req, res, next) => {
    req.scanStartedAt = Date.now();
    next();
  },
  upload.single('receipt'),
  asyncHandler(async (req, res) => {
    const receiveMs = Date.now() - req.scanStartedAt;
    validateFile(req.file);

    const jobService = getJobService();
    const jobInfo = jobService.createJob(req.file);

    // Process inside the request, not in the background
    const stats = {};
    await processReceipt(jobInfo.scanJobId, stats);

    const job = jobService.getJobStatus(jobInfo.scanJobId);
    logScan(req, job, stats, receiveMs);
    res.status(201).json({
      success: true,
      data: {
        ...job,
        message:
          job.status === 'scanned'
            ? 'Receipt scanned successfully.'
            : 'Receipt could not be scanned.',
      },
    });
  })
);

// Legacy: app builds <= 27
router.get(
  '/:scanJobId',
  asyncHandler(async (req, res) => {
    const { scanJobId } = req.params;
    validateScanJobId(scanJobId);

    const jobService = getJobService();
    const jobStatus = jobService.getJobStatus(scanJobId);

    res.json({
      success: true,
      data: jobStatus,
    });
  })
);

async function processReceipt(scanJobId, stats = {}) {
  const jobService = getJobService();
  const geminiService = getGeminiService();

  const job = jobService.getJob(scanJobId);
  if (!job) {
    console.error(`Job ${scanJobId} not found for processing`);
    return;
  }

  try {
    console.log(`Processing scan ${scanJobId}...`);
    jobService.markJobScanning(scanJobId, 1);
    
    const items = await geminiService.analyzeReceiptWithRetry(
      job.fileBuffer,
      job.mimeType,
      stats
    );

    jobService.markJobSuccess(scanJobId, items);
  } catch (error) {
    jobService.markJobFailed(scanJobId, error);
  }
}

// One structured line per scan, queryable in Cloud Logging
function logScan(req, job, stats, receiveMs) {
  const failed = job.status !== 'scanned';
  console.log(JSON.stringify({
    severity: failed || stats.totalCheck === 'mismatch' ? 'WARNING' : 'INFO',
    message: `scan ${job.status}: ${failed ? job.error?.code : `total ${stats.totalCheck}`}`,
    event: 'scan',
    status: job.status,
    errorCode: job.error?.code ?? null,
    appBuild: appBuild(req.get('user-agent')),
    firstScanOnInstance: isFirstScanOnInstance,
    fileKb: Math.round(req.file.size / 1024),
    mimeType: req.file.mimetype,
    receiveMs,
    totalMs: Date.now() - req.scanStartedAt,
    attempts: stats.attemptMs?.length ?? 0,
    attemptMs: stats.attemptMs ?? [],
    tokens: stats.tokens ?? null,
    itemCount: stats.itemCount ?? 0,
    totalCheck: stats.totalCheck ?? null,
    totalOffBy: stats.totalOffBy ?? null,
    taxAdded: stats.taxAdded ?? null,
    discountLines: stats.discountLines ?? null,
  }));
  isFirstScanOnInstance = false;
}

module.exports = router;
