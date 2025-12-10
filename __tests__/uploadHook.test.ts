// __tests__/uploadHook.test.ts
// Unit tests for upload hook

import { act, renderHook } from "@testing-library/react-native";
import { useUpload } from "../src/features/upload/hooks/useUpload";
import { apiService } from "../src/shared/services/api";
import * as storage from "../src/shared/utils/storage";

// Mock dependencies
jest.mock("../src/services/api");
jest.mock("../src/utils/storage");

describe("useUpload Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (storage.loadUploadQueue as jest.Mock).mockResolvedValue([]);
    (storage.saveUploadQueue as jest.Mock).mockResolvedValue(undefined);
  });

  it("should add item to queue", async () => {
    const { result } = renderHook(() => useUpload());

    act(() => {
      result.current.addToQueue(
        "file://test.jpg",
        "test.jpg",
        1024,
        "image/jpeg"
      );
    });

    await waitFor(() => {
      expect(result.current.queue).toHaveLength(1);
      expect(result.current.queue[0].fileName).toBe("test.jpg");
      expect(result.current.queue[0].status).toBe("pending");
    });
  });

  it("should handle successful upload", async () => {
    (apiService.uploadReceipt as jest.Mock).mockResolvedValue({
      scanJobId: "test-job-id",
      status: "queued",
      message: "Success",
    });

    const { result } = renderHook(() => useUpload());

    act(() => {
      result.current.addToQueue(
        "file://test.jpg",
        "test.jpg",
        1024,
        "image/jpeg"
      );
    });

    await waitFor(
      () => {
        const job = result.current.queue[0];
        expect(job.status).toBe("queued");
        expect(job.progress).toBe(100);
      },
      { timeout: 5000 }
    );
  });

  it("should retry failed uploads", async () => {
    let callCount = 0;
    (apiService.uploadReceipt as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount < 3) {
        return Promise.reject(new Error("Network error"));
      }
      return Promise.resolve({
        scanJobId: "test-job-id",
        status: "queued",
        message: "Success",
      });
    });

    const { result } = renderHook(() => useUpload());

    act(() => {
      result.current.addToQueue(
        "file://test.jpg",
        "test.jpg",
        1024,
        "image/jpeg"
      );
    });

    await waitFor(
      () => {
        const job = result.current.queue[0];
        expect(job.status).toBe("queued");
        expect(callCount).toBeGreaterThan(1);
      },
      { timeout: 10000 }
    );
  });

  it("should cancel upload", async () => {
    const { result } = renderHook(() => useUpload());

    let jobId: string;
    act(() => {
      jobId = result.current.addToQueue(
        "file://test.jpg",
        "test.jpg",
        1024,
        "image/jpeg"
      );
    });

    act(() => {
      result.current.cancelUpload(jobId!);
    });

    await waitFor(() => {
      expect(result.current.queue).toHaveLength(0);
    });
  });
});
