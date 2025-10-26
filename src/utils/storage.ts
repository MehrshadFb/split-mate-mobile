// src/utils/storage.ts
// AsyncStorage utilities for persisting upload queue

import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueuedUpload } from "../types/scan";

const UPLOAD_QUEUE_KEY = "@splitmate:upload_queue";

export async function saveUploadQueue(queue: QueuedUpload[]): Promise<void> {
  try {
    await AsyncStorage.setItem(UPLOAD_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("Failed to save upload queue:", error);
  }
}

export async function loadUploadQueue(): Promise<QueuedUpload[]> {
  try {
    const json = await AsyncStorage.getItem(UPLOAD_QUEUE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error("Failed to load upload queue:", error);
    return [];
  }
}

export async function clearUploadQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(UPLOAD_QUEUE_KEY);
  } catch (error) {
    console.error("Failed to clear upload queue:", error);
  }
}
