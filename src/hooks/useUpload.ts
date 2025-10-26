// src/hooks/useUpload.ts
// Upload queue management with persistence and retry logic

import { useCallback, useEffect, useRef, useState } from "react";
import { apiService } from "../services/api";
import { QueuedUpload, ScanJob } from "../types/scan";
import { createScanError } from "../utils/errors";
import { DEFAULT_RETRY_CONFIG, retryWithBackoff } from "../utils/retry";
import { loadUploadQueue, saveUploadQueue } from "../utils/storage";

export function useUpload() {
  const [queue, setQueue] = useState<ScanJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  // Load persisted queue on mount
  useEffect(() => {
    loadPersistedQueue();
  }, []);

  // Save queue to AsyncStorage whenever it changes
  useEffect(() => {
    persistQueue();
  }, [queue]);

  const loadPersistedQueue = async () => {
    const persistedQueue = await loadUploadQueue();

    // Don't load uploads that have already exceeded max attempts
    const scanJobs: ScanJob[] = persistedQueue
      .filter((upload) => upload.attempt < DEFAULT_RETRY_CONFIG.maxAttempts)
      .map((upload) => ({
        id: upload.id,
        status: "failed" as const, // Load as failed, user must manually retry
        fileUri: upload.fileUri,
        fileName: upload.fileName,
        fileSize: upload.fileSize,
        mimeType: upload.mimeType,
        progress: 0,
        attempt: upload.attempt,
        maxAttempts: DEFAULT_RETRY_CONFIG.maxAttempts,
        createdAt: upload.createdAt,
        updatedAt: new Date().toISOString(),
        error: {
          code: "UPLOAD_NETWORK_FAIL",
          message: "Upload failed. Tap to retry.",
          userMessage: "Upload failed. Tap to retry.",
          retryable: true,
        },
      }));

    setQueue(scanJobs);
  };

  const persistQueue = async () => {
    // Don't persist failed uploads - only keep pending/retrying ones
    const queuedUploads: QueuedUpload[] = queue
      .filter(
        (job) =>
          (job.status === "pending" || job.status === "retrying") &&
          job.attempt < job.maxAttempts
      )
      .map((job) => ({
        id: job.id,
        fileUri: job.fileUri,
        fileName: job.fileName,
        fileSize: job.fileSize,
        mimeType: job.mimeType,
        attempt: job.attempt,
        createdAt: job.createdAt,
      }));

    await saveUploadQueue(queuedUploads);
  };

  /**
   * Update a job in the queue
   */
  const updateJob = useCallback((jobId: string, updates: Partial<ScanJob>) => {
    setQueue((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? { ...job, ...updates, updatedAt: new Date().toISOString() }
          : job
      )
    );
  }, []);

  /**
   * Remove a job from the queue
   */
  const removeFromQueue = useCallback((jobId: string) => {
    setQueue((prev) => prev.filter((job) => job.id !== jobId));
  }, []);

  /**
   * Poll scan status until complete or failed
   */
  const pollScanStatus = useCallback(
    async (jobId: string, scanJobId: string) => {
      const maxPolls = 60; // Max 2 minutes (60 polls * 2 seconds)
      let pollCount = 0;

      const poll = async () => {
        try {
          pollCount++;
          console.log(
            `🔍 Polling scan status (${pollCount}/${maxPolls}): ${scanJobId}`
          );

          const statusResponse = await apiService.getScanStatus(scanJobId);
          const { status, result, error } = statusResponse.data;

          console.log(`📊 Scan status: ${status}`);

          if (status === "scanned" && result) {
            // Success! Update job with results
            console.log(`✅ Scan complete! Items:`, result.items);
            updateJob(jobId, {
              status: "scanned",
              result,
            });
            return; // Stop polling
          } else if (status === "failed" && error) {
            // Scan failed
            console.error(`❌ Scan failed:`, error);
            updateJob(jobId, {
              status: "failed",
              error: {
                code: error.code,
                message: error.message,
                userMessage:
                  "AI failed to read receipt. Try again or enter manually.",
                retryable: true,
              },
            });
            return; // Stop polling
          } else if (status === "scanning" || status === "queued") {
            // Still processing, continue polling
            if (pollCount < maxPolls) {
              setTimeout(poll, 2000); // Poll every 2 seconds
            } else {
              // Timeout
              console.error(`⏱️ Polling timeout for ${scanJobId}`);
              updateJob(jobId, {
                status: "failed",
                error: {
                  code: "TIMEOUT",
                  message: "Processing took too long",
                  userMessage: "Processing timed out. Please try again.",
                  retryable: true,
                },
              });
            }
          }
        } catch (error: any) {
          console.error(`❌ Poll error:`, error);
          updateJob(jobId, {
            status: "failed",
            error: createScanError(error),
          });
        }
      };

      // Start polling
      poll();
    },
    [updateJob]
  );

  /**
   * Upload a single job with retry logic
   */
  const uploadWithRetry = useCallback(
    async (job: ScanJob) => {
      console.log(`📤 Starting upload for ${job.fileName}`);

      // Set processing flag
      processingRef.current = true;
      setIsProcessing(true);

      // Update status to uploading
      updateJob(job.id, { status: "uploading", attempt: job.attempt + 1 });

      try {
        const response = await retryWithBackoff(
          async () => {
            console.log(`🔄 Attempting upload: ${job.fileName}`);
            return await apiService.uploadReceipt(
              job.fileUri,
              job.fileName,
              job.mimeType,
              (progress) => {
                console.log(`📊 Progress for ${job.fileName}: ${progress}%`);
                updateJob(job.id, { progress });
              }
            );
          },
          DEFAULT_RETRY_CONFIG,
          (attempt, error) => {
            console.log(
              `Retry attempt ${attempt} for ${job.fileName}:`,
              error.message
            );
            updateJob(job.id, { status: "retrying", attempt });
          }
        );

        console.log(`✅ Upload successful for ${job.fileName}`, response);

        // Upload successful - update job with scanJobId and start polling
        const scanJobId = response.data.scanJobId;
        updateJob(job.id, {
          status: "scanning",
          progress: 100,
          scanJobId,
        });

        // Start polling for scan results
        pollScanStatus(job.id, scanJobId);
      } catch (error: any) {
        console.log(`❌ Upload failed for ${job.fileName}:`, error);
        const scanError = createScanError(error);

        // Always mark as failed - user must manually retry
        updateJob(job.id, {
          status: "failed",
          error: scanError,
        });
      } finally {
        // Reset processing flag
        processingRef.current = false;
        setIsProcessing(false);
      }
    },
    [updateJob, removeFromQueue]
  );

  /**
   * Add a new file to the upload queue (WITHOUT auto-processing)
   */
  const addToQueue = useCallback(
    (fileUri: string, fileName: string, fileSize: number, mimeType: string) => {
      console.log(`➕ Adding to queue: ${fileName}`);

      const newJob: ScanJob = {
        id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: "queued", // Mark as queued, waiting for user to process
        fileUri,
        fileName,
        fileSize,
        mimeType,
        progress: 0,
        attempt: 0,
        maxAttempts: DEFAULT_RETRY_CONFIG.maxAttempts,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setQueue((prev) => [...prev, newJob]);

      return newJob.id;
    },
    []
  );

  /**
   * Process all queued receipts
   */
  const processAllReceipts = useCallback(async () => {
    const queuedJobs = queue.filter((job) => job.status === "queued");

    if (queuedJobs.length === 0) {
      console.log("⚠️ No receipts to process");
      return;
    }

    console.log(`🚀 Processing ${queuedJobs.length} receipts`);

    processingRef.current = true;
    setIsProcessing(true);

    // Process all receipts in parallel
    await Promise.all(queuedJobs.map((job) => uploadWithRetry(job)));

    processingRef.current = false;
    setIsProcessing(false);
  }, [queue, uploadWithRetry]);

  /**
   * Cancel an upload
   */
  const cancelUpload = useCallback(
    (jobId: string) => {
      apiService.cancelUpload(jobId);
      removeFromQueue(jobId);
    },
    [removeFromQueue]
  );

  /**
   * Retry a failed upload
   */
  const retryUpload = useCallback(
    (jobId: string) => {
      const job = queue.find((j) => j.id === jobId);
      if (!job) return;

      updateJob(jobId, {
        status: "pending",
        attempt: 0,
        error: undefined,
        progress: 0,
      });

      // Start upload in next tick
      setTimeout(() => {
        uploadWithRetry({
          ...job,
          attempt: 0,
          status: "pending",
          error: undefined,
          progress: 0,
        });
      }, 0);
    },
    [queue, updateJob, uploadWithRetry]
  );

  /**
   * Clear all completed/failed uploads
   */
  const clearCompleted = useCallback(() => {
    setQueue((prev) =>
      prev.filter((job) => job.status !== "scanned" && job.status !== "failed")
    );
  }, []);

  return {
    queue,
    isProcessing,
    addToQueue,
    processAllReceipts,
    cancelUpload,
    retryUpload,
    clearCompleted,
  };
}
