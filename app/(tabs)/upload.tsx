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
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background.primary }}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <Ionicons
            name="people-outline"
            size={64}
            color={colors.text.tertiary}
          />
          <Text
            style={{
              color: colors.text.primary,
              fontSize: 20,
              fontWeight: "600",
              marginTop: 16,
              textAlign: "center",
            }}
          >
            Add Your Mates First
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              textAlign: "center",
              marginTop: 8,
              marginBottom: 24,
            }}
          >
            Go to the Mates tab and add at least 2 people to split the bill with
          </Text>
          <Button
            title="Go to Mates"
            onPress={() => router.push("/(tabs)")}
            variant="primary"
            icon={
              <Ionicons name="people" size={20} color={colors.text.inverse} />
            }
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
    >
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 24 }}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/mates")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 24,
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 36,
                fontWeight: "bold",
                color: colors.text.primary,
                marginBottom: 8,
              }}
            >
              Upload Receipt
            </Text>
            <Text style={{ fontSize: 18, color: colors.text.secondary }}>
              Take a photo or choose from your library
            </Text>
          </View>

          {/* Camera Button */}
          <TouchableOpacity
            onPress={handleTakePhoto}
            style={{
              backgroundColor: colors.accent.primary,
              borderRadius: 16,
              padding: 24,
              marginBottom: 16,
              alignItems: "center",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="camera" size={48} color={colors.text.inverse} />
            <Text
              style={{
                color: colors.text.inverse,
                fontWeight: "bold",
                fontSize: 18,
                marginTop: 12,
              }}
            >
              Take Photo
            </Text>
            <Text
              style={{
                color: colors.text.inverse,
                fontSize: 14,
                marginTop: 4,
                opacity: 0.8,
              }}
            >
              Use your camera to capture the receipt
            </Text>
          </TouchableOpacity>

          {/* File Picker Button */}
          <TouchableOpacity
            onPress={handleChooseFile}
            style={{
              backgroundColor: colors.background.secondary,
              borderWidth: 2,
              borderColor: colors.border,
              borderRadius: 16,
              padding: 24,
              marginBottom: 16,
              alignItems: "center",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="image" size={48} color={colors.accent.primary} />
            <Text
              style={{
                color: colors.text.primary,
                fontWeight: "bold",
                fontSize: 18,
                marginTop: 12,
              }}
            >
              Choose from Library
            </Text>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: 14,
                marginTop: 4,
              }}
            >
              Select an existing photo
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 24,
            }}
          >
            <View
              style={{ flex: 1, height: 1, backgroundColor: colors.border }}
            />
            <Text
              style={{
                color: colors.text.tertiary,
                fontSize: 14,
                marginHorizontal: 16,
              }}
            >
              or
            </Text>
            <View
              style={{ flex: 1, height: 1, backgroundColor: colors.border }}
            />
          </View>

          {/* Manual Entry Button */}
          <Button
            title="Add Items Manually"
            onPress={handleManualEntry}
            variant="outline"
            size="large"
            fullWidth
            icon={
              <Ionicons
                name="create-outline"
                size={20}
                color={colors.accent.primary}
              />
            }
          />

          {/* Preview Selected Images */}
          {selectedImages.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Text
                style={{
                  color: colors.text.primary,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Selected Receipts ({selectedImages.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedImages.map((uri, index) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={{
                      width: 128,
                      height: 192,
                      borderRadius: 12,
                      marginRight: 12,
                    }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Queued Receipts */}
          {queuedReceipts.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Text
                style={{
                  color: colors.text.primary,
                  fontWeight: "600",
                  marginBottom: 12,
                }}
              >
                {queuedReceipts.length} receipt
                {queuedReceipts.length > 1 ? "s" : ""} ready to process
              </Text>
              {queuedReceipts.map((job) => (
                <View
                  key={job.id}
                  style={{
                    backgroundColor: colors.background.secondary,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ color: colors.text.primary, fontWeight: "500" }}
                    >
                      {job.fileName}
                    </Text>
                    <Text
                      style={{
                        color: colors.text.tertiary,
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      Ready to scan
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => cancelUpload(job.id)}
                    style={{ marginLeft: 8 }}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={colors.error}
                    />
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
                icon={
                  <Ionicons
                    name="sparkles"
                    size={20}
                    color={colors.text.inverse}
                  />
                }
              />
            </View>
          )}

          {/* Processing Uploads */}
          {processingUploads.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Text
                style={{
                  color: colors.text.primary,
                  fontWeight: "600",
                  marginBottom: 12,
                }}
              >
                Processing {processingUploads.length} receipt
                {processingUploads.length > 1 ? "s" : ""}
              </Text>
              {processingUploads.map((job) => (
                <View
                  key={job.id}
                  style={{
                    backgroundColor: colors.background.secondary,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontWeight: "500",
                        flex: 1,
                      }}
                    >
                      {job.fileName}
                    </Text>
                  </View>
                  <ProgressBar progress={job.progress} />
                  <Text
                    style={{
                      color: colors.text.tertiary,
                      fontSize: 12,
                      marginTop: 8,
                    }}
                  >
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
          <View
            style={{
              marginTop: 32,
              backgroundColor: colors.accent.light,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <Ionicons
                name="information-circle"
                size={20}
                color={colors.accent.primary}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={{
                    color: colors.accent.hover,
                    fontWeight: "600",
                    marginBottom: 4,
                  }}
                >
                  Supported Files
                </Text>
                <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
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
