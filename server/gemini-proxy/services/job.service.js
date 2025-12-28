const crypto = require('crypto');
const config = require('../config');
const { ValidationError } = require('../utils/validators');

const JobStatus = {
  QUEUED: 'queued',
  SCANNING: 'scanning',
  RETRYING: 'retrying',
  SCANNED: 'scanned',
  FAILED: 'failed',
};

// TODO: Replace in-memory store with persistent storage (e.g., Redis) for scalability
class JobService {
  constructor() {
    this.jobs = new Map();
    this._startCleanupInterval(); // Start periodic cleanup of expired jobs
  }

  createJob(file) {
    const scanJobId = crypto.randomUUID();
    const job = {
      scanJobId,
      status: JobStatus.QUEUED,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      fileBuffer: file.buffer,
      attempt: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.jobs.set(scanJobId, job);
    this._enforceJobLimit(); // Enforce max stored jobs limit - remove oldest if necessary
    return {
      scanJobId,
      status: job.status,
      createdAt: job.createdAt,
    };
  }

  getJob(scanJobId) {
    return this.jobs.get(scanJobId) || null;
  }

  getJobStatus(scanJobId) {
    const job = this.getJob(scanJobId);
    if (!job) {
      throw new ValidationError('Scan job not found', 'JOB_NOT_FOUND');
    }
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
    return response;
  }

  updateJobStatus(scanJobId, status, data = {}) {
    const job = this.getJob(scanJobId);
    if (!job) {
      console.error(`Cannot update non-existent job: ${scanJobId}`);
      return;
    }
    // Update status and timestamp
    job.status = status;
    job.updatedAt = new Date().toISOString();
    Object.assign(job, data); // Merge additional data into job
    this.jobs.set(scanJobId, job);
  }

  markJobScanning(scanJobId, attempt) {
    this.updateJobStatus(scanJobId, JobStatus.SCANNING, { attempt });
  }

  markJobRetrying(scanJobId) {
    this.updateJobStatus(scanJobId, JobStatus.RETRYING);
  }

  markJobSuccess(scanJobId, items) {
    const job = this.getJob(scanJobId);
    if (!job) {
      console.error(`Cannot mark non-existent job as success: ${scanJobId}`);
      return;
    }
    job.status = JobStatus.SCANNED;
    job.result = { items };
    job.updatedAt = new Date().toISOString();
    delete job.fileBuffer; // Clear buffer to free memory
    this.jobs.set(scanJobId, job);
    console.log(`Job ${scanJobId} completed successfully with ${items.length} items`);
  }

  markJobFailed(scanJobId, error) {
    const job = this.getJob(scanJobId);
    if (!job) {
      console.error(`Cannot mark non-existent job as failed: ${scanJobId}`);
      return;
    }
    job.status = JobStatus.FAILED;
    job.error = {
      code: error.code || 'PROCESSING_ERROR',
      message: error.message || 'Unknown error occurred',
    };
    job.updatedAt = new Date().toISOString();
    delete job.fileBuffer; // Clear buffer to free memory
    this.jobs.set(scanJobId, job);
    console.error(`Job ${scanJobId} failed: ${error.message}`);
  }

  deleteJob(scanJobId) {
    this.jobs.delete(scanJobId);
  }

  getJobCount() {
    return this.jobs.size;
  }

  _enforceJobLimit() {
    if (this.jobs.size <= config.jobs.maxStoredJobs) {
      return;
    }
    // Sort jobs by creation time and remove oldest
    const sortedJobs = Array.from(this.jobs.entries())
      .sort(([, a], [, b]) => new Date(a.createdAt) - new Date(b.createdAt));
    // Remove oldest jobs exceeding the limit
    const toRemove = this.jobs.size - config.jobs.maxStoredJobs;
    for (let i = 0; i < toRemove; i++) {
      const [jobId] = sortedJobs[i];
      this.jobs.delete(jobId);
      console.log(`Removed old job ${jobId} to enforce limit`);
    }
  }

  _cleanupExpiredJobs() {
    const now = Date.now();
    let removedCount = 0;
    for (const [jobId, job] of this.jobs.entries()) {
      const jobAge = now - new Date(job.createdAt).getTime();
      // Remove jobs older than expiration time
      if (jobAge > config.jobs.jobExpirationMs) {
        this.jobs.delete(jobId);
        removedCount++;
      }
    }
    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} expired jobs`);
    }
  }

  _startCleanupInterval() {
    const cleanupInterval = 10 * 60 * 1000; // 10 minutes
    setInterval(() => {
      this._cleanupExpiredJobs();
    }, cleanupInterval);
    console.log(`Job cleanup interval started (every ${cleanupInterval / 1000}s)`);
  }

  getStats() {
    const stats = {
      total: 0,
      queued: 0,
      scanning: 0,
      retrying: 0,
      scanned: 0,
      failed: 0,
    };
    for (const job of this.jobs.values()) {
      stats.total++;
      stats[job.status] = (stats[job.status] || 0) + 1;
    }
    return stats;
  }
}

// Singleton instance
let jobServiceInstance;
function getJobService() {
  if (!jobServiceInstance) {
    jobServiceInstance = new JobService();
  }
  return jobServiceInstance;
}

module.exports = {
  JobService,
  JobStatus,
  getJobService,
};
