const express = require('express');
const { asyncHandler } = require('../middleware/error.middleware');
const upload = require('../middleware/upload.middleware');
const { validateFile, validateScanJobId } = require('../utils/validators');
const { getJobService } = require('../services/job.service');
const { getGeminiService } = require('../services/gemini.service');

const router = express.Router();

router.post(
  '/',
  upload.single('receipt'),
  asyncHandler(async (req, res) => {
    validateFile(req.file);

    const jobService = getJobService();
    const jobInfo = jobService.createJob(req.file);

    processReceipt(jobInfo.scanJobId).catch(error => {
      console.error(`Error processing scan ${jobInfo.scanJobId}:`, error);
    });

    res.status(201).json({
      success: true,
      data: {
        scanJobId: jobInfo.scanJobId,
        status: jobInfo.status,
        message: 'Receipt uploaded successfully. Processing started.',
      },
    });
  })
);

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

async function processReceipt(scanJobId) {
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
      job.mimeType
    );

    jobService.markJobSuccess(scanJobId, items);
  } catch (error) {
    jobService.markJobFailed(scanJobId, error);
  }
}

module.exports = router;
