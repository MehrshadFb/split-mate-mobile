// app/(tabs)/upload.tsx
// Upload receipt screen with camera and file picker

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/Button";
import { ErrorBanner } from "../../src/components/ErrorBanner";
import { ProgressBar } from "../../src/components/ProgressBar";
import { useTheme } from "../../src/contexts/ThemeContext";
import { useUpload } from "../../src/hooks/useUpload";
import { useInvoiceStore } from "../../src/stores/invoiceStore";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/pdf",
];

export default function UploadScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { queue, addToQueue, processAllReceipts, cancelUpload, retryUpload } =
    useUpload();
  const { people, addItem, clearInvoice, setEditingSavedInvoice } =
    useInvoiceStore();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // Watch for all scans to complete and navigate
  useEffect(() => {
    const scannedJobs = queue.filter((job) => job.status === "scanned");
    const processingJobs = queue.filter(
      (job) =>
        job.status === "uploading" ||
        job.status === "scanning" ||
        job.status === "pending"
    );

    // If we have scanned jobs and no more processing, navigate
    if (scannedJobs.length > 0 && processingJobs.length === 0) {
      console.log(
        `🎉 All ${scannedJobs.length} receipts scanned! Navigating...`
      );

      // Clear existing invoice items before adding new ones
      clearInvoice();
      setEditingSavedInvoice(false);

      // Add all items from all receipts
      scannedJobs.forEach((job) => {
        if (job.result?.items) {
          job.result.items.forEach((item) => {
            addItem({
              name: item.name,
              price: item.price,
              splitBetween: [], // User will assign people
            });
          });
        }
      });

      // Navigate to items assignment screen (not a tab)
      setTimeout(() => {
        router.push("/assign-items");
      }, 500);
    }
  }, [queue, clearInvoice, addItem, router, setEditingSavedInvoice]);

  // Check if mates are added
  if (people.length < 2) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary">
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="people-outline" size={64} color="#A8A29E" />
          <Text className="text-text-primary text-xl font-semibold mt-4 text-center">
            Add Your Mates First
          </Text>
          <Text className="text-text-secondary text-center mt-2 mb-6">
            Go to the Mates tab and add at least 2 people to split the bill with
          </Text>
          <Button
            title="Go to Mates"
            onPress={() => router.push("/(tabs)")}
            variant="primary"
            icon={<Ionicons name="people" size={20} color="white" />}
          />
        </View>
      </SafeAreaView>
    );
  }

  const validateFile = (uri: string, type: string, size?: number): boolean => {
    // Check file type
    if (!ALLOWED_TYPES.some((allowed) => type.includes(allowed))) {
      Alert.alert(
        "Unsupported File",
        "This file isn't supported. Try a JPG, PNG, or PDF under 10 MB."
      );
      return false;
    }

    // Check file size
    if (size && size > MAX_FILE_SIZE) {
      Alert.alert(
        "File Too Large",
        "This file is too large. Try a file under 10 MB."
      );
      return false;
    }

    return true;
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera access is needed to take photos of receipts."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: true,
        aspect: [3, 4],
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (
          validateFile(
            asset.uri,
            asset.mimeType || "image/jpeg",
            asset.fileSize
          )
        ) {
          setSelectedImages((prev) => [...prev, asset.uri]);
          addToQueue(
            asset.uri,
            asset.fileName || `receipt-${Date.now()}.jpg`,
            asset.fileSize || 0,
            asset.mimeType || "image/jpeg"
          );
        }
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Failed to access camera. Please try again.");
    }
  };

  const handleChooseFile = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: true,
        aspect: [3, 4],
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (
          validateFile(
            asset.uri,
            asset.mimeType || "image/jpeg",
            asset.fileSize
          )
        ) {
          setSelectedImages((prev) => [...prev, asset.uri]);
          addToQueue(
            asset.uri,
            asset.fileName || `receipt-${Date.now()}.jpg`,
            asset.fileSize || 0,
            asset.mimeType || "image/jpeg"
          );
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleManualEntry = () => {
    clearInvoice();
    setEditingSavedInvoice(false);
    router.push("/assign-items");
  };

  const queuedReceipts = queue.filter((job) => job.status === "queued");
  const processingUploads = queue.filter(
    (job) =>
      job.status === "uploading" ||
      job.status === "pending" ||
      job.status === "scanning"
  );
  const failedUploads = queue.filter((job) => job.status === "failed");

  const canProcess =
    queuedReceipts.length > 0 && processingUploads.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <ScrollView className="flex-1">
        <View className="p-6">
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/mates")}
            className="flex-row items-center mb-6"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          {/* Header */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-text-primary mb-2">
              Upload Receipt
            </Text>
            <Text className="text-lg text-text-secondary">
              Take a photo or choose from your library
            </Text>
          </View>

          {/* Camera Button */}
          <TouchableOpacity
            onPress={handleTakePhoto}
            className="bg-accent-primary rounded-2xl p-6 mb-4 items-center"
            activeOpacity={0.7}
          >
            <Ionicons name="camera" size={48} color="white" />
            <Text className="text-text-inverse font-bold text-lg mt-3">
              Take Photo
            </Text>
            <Text className="text-text-inverse text-sm mt-1 opacity-80">
              Use your camera to capture the receipt
            </Text>
          </TouchableOpacity>

          {/* File Picker Button */}
          <TouchableOpacity
            onPress={handleChooseFile}
            className="bg-background-secondary border-2 border-border rounded-2xl p-6 mb-4 items-center"
            activeOpacity={0.7}
          >
            <Ionicons name="image" size={48} color="#D97757" />
            <Text className="text-text-primary font-bold text-lg mt-3">
              Choose from Library
            </Text>
            <Text className="text-text-secondary text-sm mt-1">
              Select an existing photo
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-border" />
            <Text className="text-text-tertiary text-sm mx-4">or</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Manual Entry Button */}
          <Button
            title="Add Items Manually"
            onPress={handleManualEntry}
            variant="outline"
            size="large"
            fullWidth
            icon={<Ionicons name="create-outline" size={20} color="#D97757" />}
          />

          {/* Preview Selected Images */}
          {selectedImages.length > 0 && (
            <View className="mt-6">
              <Text className="text-text-primary font-semibold mb-2">
                Selected Receipts ({selectedImages.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedImages.map((uri, index) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    className="w-32 h-48 rounded-xl mr-3"
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Queued Receipts */}
          {queuedReceipts.length > 0 && (
            <View className="mt-6">
              <Text className="text-text-primary font-semibold mb-3">
                {queuedReceipts.length} receipt
                {queuedReceipts.length > 1 ? "s" : ""} ready to process
              </Text>
              {queuedReceipts.map((job) => (
                <View
                  key={job.id}
                  className="bg-background-secondary rounded-xl p-4 mb-3 flex-row items-center justify-between"
                >
                  <View className="flex-1">
                    <Text className="text-text-primary font-medium">
                      {job.fileName}
                    </Text>
                    <Text className="text-text-tertiary text-xs mt-1">
                      Ready to scan
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => cancelUpload(job.id)}
                    className="ml-2"
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Process All Button */}
              <Button
                title={`Process ${queuedReceipts.length} Receipt${
                  queuedReceipts.length > 1 ? "s" : ""
                }`}
                onPress={processAllReceipts}
                variant="primary"
                size="large"
                fullWidth
                disabled={!canProcess}
                icon={<Ionicons name="sparkles" size={20} color="white" />}
              />
            </View>
          )}

          {/* Processing Uploads */}
          {processingUploads.length > 0 && (
            <View className="mt-6">
              <Text className="text-text-primary font-semibold mb-3">
                Processing {processingUploads.length} receipt
                {processingUploads.length > 1 ? "s" : ""}
              </Text>
              {processingUploads.map((job) => (
                <View
                  key={job.id}
                  className="bg-background-secondary rounded-xl p-4 mb-3"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-text-primary font-medium flex-1">
                      {job.fileName}
                    </Text>
                  </View>
                  <ProgressBar progress={job.progress} />
                  <Text className="text-text-tertiary text-xs mt-2">
                    {job.status === "uploading" && "Uploading..."}
                    {job.status === "scanning" && "🤖 AI reading receipt..."}
                    {job.status === "pending" && "Waiting..."}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Failed Uploads */}
          {failedUploads.map((job) => (
            <ErrorBanner
              key={job.id}
              message={job.error?.userMessage || "Upload failed"}
              onRetry={() => retryUpload(job.id)}
              retryCount={job.attempt}
              onDismiss={() => cancelUpload(job.id)}
            />
          ))}

          {/* Info */}
          <View className="mt-8 bg-accent-light rounded-xl p-4">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#D97757" />
              <View className="flex-1 ml-3">
                <Text className="text-accent-hover font-semibold mb-1">
                  Supported Files
                </Text>
                <Text className="text-text-secondary text-sm">
                  JPG, PNG, or PDF files under 10 MB{"\n"}
                  Your receipt will be securely processed by AI
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
