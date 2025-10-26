// Quick script to clear AsyncStorage
// Run this in your app to clear stuck uploads

import AsyncStorage from "@react-native-async-storage/async-storage";

export async function clearAllStorage() {
  try {
    await AsyncStorage.clear();
    console.log("✅ AsyncStorage cleared successfully");
  } catch (error) {
    console.error("❌ Failed to clear AsyncStorage:", error);
  }
}

// Clear only upload queue
export async function clearUploadQueue() {
  try {
    await AsyncStorage.removeItem("@splitmate:upload_queue");
    console.log("✅ Upload queue cleared successfully");
  } catch (error) {
    console.error("❌ Failed to clear upload queue:", error);
  }
}
