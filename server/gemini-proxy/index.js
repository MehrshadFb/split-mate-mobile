// server/gemini-proxy/index.js
// Gemini AI proxy server for SplitMate - Production-ready with queue and retry

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const crypto = require("crypto");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: (process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024, // Default 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, PNG, and PDF are allowed."));
    }
  },
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use gemini-1.5-pro or gemini-1.5-flash for vision capabilities
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// In-memory job storage (use Redis in production)
const scanJobs = new Map();

// Gemini processing configuration
const GEMINI_CONFIG = {
  maxRetries: parseInt(process.env.MAX_GEMINI_RETRIES) || 3,
  timeout: parseInt(process.env.GEMINI_TIMEOUT_MS) || 30000,
  retryDelay: 1000, // Initial delay in ms
  retryFactor: 2,
};

/**
 * Health check endpoint
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * Upload receipt and start processing
 * POST /api/scan
 */
app.post("/api/scan", upload.single("receipt"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: "NO_FILE",
          message: "No file uploaded",
        },
      });
    }

    // Generate unique scan job ID
    const scanJobId = crypto.randomUUID();

    // Create scan job
    const scanJob = {
      scanJobId,
      status: "queued",
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      fileBuffer: req.file.buffer,
      attempt: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    scanJobs.set(scanJobId, scanJob);

    // Start processing asynchronously (don't await)
    processGeminiScan(scanJobId).catch((err) => {
      console.error(`Error processing scan ${scanJobId}:`, err);
    });

    // Return immediately with job ID
    res.json({
      success: true,
      data: {
        scanJobId,
        status: "queued",
        message: "Receipt uploaded successfully. Processing started.",
      },
    });
  } catch (error) {
    console.error("Upload error:", error);

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        error: {
          code: "FILE_TOO_LARGE",
          message: "File size exceeds limit",
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: "UPLOAD_ERROR",
        message: error.message,
      },
    });
  }
});

/**
 * Get scan job status
 * GET /api/scan/:scanJobId
 */
app.get("/api/scan/:scanJobId", (req, res) => {
  const { scanJobId } = req.params;
  const job = scanJobs.get(scanJobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: {
        code: "JOB_NOT_FOUND",
        message: "Scan job not found",
      },
    });
  }

  // Return job status without sensitive data
  const response = {
    scanJobId: job.scanJobId,
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };

  if (job.result) {
    response.result = job.result;
  }

  if (job.error) {
    response.error = job.error;
  }

  res.json({
    success: true,
    data: response,
  });
});

/**
 * Process receipt with Gemini AI
 * Includes retry logic with exponential backoff
 */
async function processGeminiScan(scanJobId) {
  const job = scanJobs.get(scanJobId);
  if (!job) return;

  for (let attempt = 0; attempt < GEMINI_CONFIG.maxRetries; attempt++) {
    job.attempt = attempt + 1;
    job.status = "scanning";
    job.updatedAt = new Date().toISOString();
    scanJobs.set(scanJobId, job);

    try {
      console.log(`Processing scan ${scanJobId}, attempt ${attempt + 1}`);

      // Convert buffer to base64
      const base64Data = job.fileBuffer.toString("base64");

      const prompt = `
        Analyze this receipt image and extract all items with their prices, including tax as a separate item.
        
        Please return ONLY a JSON array in this exact format:
        [
          {"name": "item name", "price": 12.99},
          {"name": "another item", "price": 5.50},
          {"name": "Tax", "price": 2.34}
        ]
        
        Rules:
        - Include all purchased items (food, products, services)
        - Include tax as a separate item with name "Tax" if tax is shown on the receipt
        - Include any service charges or fees as separate items
        - Exclude tips, subtotals, grand totals, payment methods, store info, dates, etc.
        - Exclude TPD (Total Potential Discount) as it represents discounts, not charges
        - Extract exact item names as they appear on the receipt
        - Prices should be numbers (not strings)
        - If you can't clearly read an item or price, skip it
        - Return only the JSON array, no other text or explanation
      `;

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: job.mimeType,
        },
      };

      // Call Gemini with timeout
      const result = await Promise.race([
        model.generateContent([prompt, imagePart]),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Gemini timeout")),
            GEMINI_CONFIG.timeout
          )
        ),
      ]);

      const response = await result.response;
      const text = response.text();

      // Parse JSON from response
      let extractedItems;
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          extractedItems = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No valid JSON found in response");
        }
      } catch (parseError) {
        throw new Error("Failed to parse Gemini response as JSON");
      }

      // Validate extracted items
      const validatedItems = extractedItems.map((item) => ({
        name: item.name || "Unknown Item",
        price:
          typeof item.price === "number"
            ? item.price
            : parseFloat(item.price) || 0,
      }));

      // Update job with success
      job.status = "scanned";
      job.result = { items: validatedItems };
      job.updatedAt = new Date().toISOString();
      delete job.fileBuffer; // Clear buffer to save memory
      scanJobs.set(scanJobId, job);

      console.log(`✓ Scan ${scanJobId} completed successfully`);

      // TODO: Send push notification to client
      // await sendPushNotification(job.userId, scanJobId, 'success');

      return;
    } catch (error) {
      console.error(
        `✗ Scan ${scanJobId} attempt ${attempt + 1} failed:`,
        error.message
      );

      // Check if should retry
      if (attempt < GEMINI_CONFIG.maxRetries - 1) {
        job.status = "retrying";
        job.updatedAt = new Date().toISOString();
        scanJobs.set(scanJobId, job);

        // Exponential backoff with jitter
        const delay =
          GEMINI_CONFIG.retryDelay *
          Math.pow(GEMINI_CONFIG.retryFactor, attempt);
        const jitter = Math.random() * 0.3 * delay;
        await new Promise((resolve) => setTimeout(resolve, delay + jitter));
      } else {
        // Max retries reached - mark as failed
        job.status = "failed";
        job.error = {
          code: error.message.includes("timeout")
            ? "GEMINI_TIMEOUT"
            : "PARSE_FAILED",
          message: error.message,
        };
        job.updatedAt = new Date().toISOString();
        delete job.fileBuffer; // Clear buffer
        scanJobs.set(scanJobId, job);

        console.error(
          `✗ Scan ${scanJobId} failed after ${GEMINI_CONFIG.maxRetries} attempts`
        );

        // TODO: Send failure push notification
        // await sendPushNotification(job.userId, scanJobId, 'failed');
      }
    }
  }
}

/**
 * Send push notification (placeholder - implement with Expo or APNs)
 */
async function sendPushNotification(userId, scanJobId, status) {
  // TODO: Implement push notification
  // For Expo: Use Expo Push Notification service
  // For APNs: Use node-apn or similar library

  console.log(
    `[Push Notification] User: ${userId}, Job: ${scanJobId}, Status: ${status}`
  );
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(error.status || 500).json({
    success: false,
    error: {
      code: error.code || "SERVER_ERROR",
      message: error.message || "Internal server error",
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Gemini Proxy Server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`   Gemini Model: gemini-2.5-pro`);
  console.log(`   Max retries: ${GEMINI_CONFIG.maxRetries}`);
  console.log(`   Timeout: ${GEMINI_CONFIG.timeout}ms`);
});

module.exports = app;
