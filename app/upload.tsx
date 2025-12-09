// app/upload.tsx
// Simplified upload receipt screen

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../src/shared/contexts/ThemeContext";
import { useUpload } from "../src/shared/hooks/useUpload";
import { Button } from "../src/shared/components/Button";
import { useInvoiceStore } from "../src/shared/stores/invoiceStore";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

interface SelectedImage {
  uri: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
}

export default function UploadScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { uploadReceipts, isLoading, error, clearError } = useUpload();
  const { addItem, clearInvoice, setEditingSavedInvoice } = useInvoiceStore();
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);

  const validateFile = (uri: string, type: string, size?: number): boolean => {
    // Check file type
    if (!ALLOWED_TYPES.some((allowed) => type.includes(allowed))) {
      Alert.alert(
        "Unsupported File",
        "Please select a JPG or PNG image under 10 MB."
      );
      return false;
    }

    // Check file size
    if (size && size > MAX_FILE_SIZE) {
      Alert.alert("File Too Large", "Please select an image under 10 MB.");
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
        const mimeType = asset.mimeType || "image/jpeg";

        if (validateFile(asset.uri, mimeType, asset.fileSize)) {
          setSelectedImages((prev) => [
            ...prev,
            {
              uri: asset.uri,
              fileName: asset.fileName || `receipt-${Date.now()}.jpg`,
              mimeType,
              fileSize: asset.fileSize,
            },
          ]);
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
        const mimeType = asset.mimeType || "image/jpeg";

        if (validateFile(asset.uri, mimeType, asset.fileSize)) {
          setSelectedImages((prev) => [
            ...prev,
            {
              uri: asset.uri,
              fileName: asset.fileName || `receipt-${Date.now()}.jpg`,
              mimeType,
              fileSize: asset.fileSize,
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    clearError();
  };

  const handleProceed = async () => {
    if (selectedImages.length === 0) return;

    clearError();

    // Upload and process
    const items = await uploadReceipts(selectedImages);

    if (items && items.length > 0) {
      // Success! Clear existing invoice and add new items
      clearInvoice();
      setEditingSavedInvoice(false);

      items.forEach((item) => {
        addItem({
          name: item.name,
          price: item.price,
          splitBetween: [], // User will assign people
        });
      });

      // Navigate to items assignment screen
      router.push("/assign-items");
    }
    // Error is already set by the hook
  };

  const handleManualEntry = () => {
    clearInvoice();
    setEditingSavedInvoice(false);
    router.push("/assign-items");
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
      edges={["top", "left", "right"]}
    >
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 24 }}>
          <TouchableOpacity
            onPress={() => router.back()}
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
            disabled={isLoading}
            style={{
              backgroundColor: colors.accent.primary,
              borderRadius: 16,
              padding: 24,
              marginBottom: 16,
              alignItems: "center",
              opacity: isLoading ? 0.5 : 1,
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
            disabled={isLoading}
            style={{
              backgroundColor: colors.background.secondary,
              borderWidth: 2,
              borderColor: colors.border,
              borderRadius: 16,
              padding: 24,
              marginBottom: 16,
              alignItems: "center",
              opacity: isLoading ? 0.5 : 1,
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

          {/* Preview Selected Images */}
          {selectedImages.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Text
                style={{
                  color: colors.text.primary,
                  fontWeight: "600",
                  marginBottom: 12,
                }}
              >
                Selected Receipts ({selectedImages.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedImages.map((image, index) => (
                  <View
                    key={index}
                    style={{ marginRight: 12, position: "relative" }}
                  >
                    <Image
                      source={{ uri: image.uri }}
                      style={{
                        width: 128,
                        height: 192,
                        borderRadius: 12,
                      }}
                      resizeMode="cover"
                    />
                    {!isLoading && (
                      <TouchableOpacity
                        onPress={() => handleRemoveImage(index)}
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          backgroundColor: colors.error,
                          borderRadius: 12,
                          width: 24,
                          height: 24,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons name="close" size={16} color="white" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </ScrollView>

              {/* Proceed Button */}
              <View style={{ marginTop: 16 }}>
                <Button
                  title={
                    isLoading
                      ? "Processing..."
                      : `Proceed with ${selectedImages.length} Receipt${
                          selectedImages.length > 1 ? "s" : ""
                        }`
                  }
                  onPress={handleProceed}
                  variant="primary"
                  size="large"
                  fullWidth
                  disabled={selectedImages.length === 0}
                  loading={isLoading}
                  icon={
                    !isLoading ? (
                      <Ionicons
                        name="sparkles"
                        size={20}
                        color={colors.text.inverse}
                      />
                    ) : undefined
                  }
                />
              </View>

              {/* Error Message */}
              {error && (
                <View
                  style={{
                    marginTop: 16,
                    backgroundColor: colors.error + "20",
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.error,
                  }}
                >
                  <View
                    style={{ flexDirection: "row", alignItems: "flex-start" }}
                  >
                    <Ionicons
                      name="alert-circle"
                      size={20}
                      color={colors.error}
                      style={{ marginRight: 8 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: colors.error,
                          fontWeight: "600",
                          marginBottom: 4,
                        }}
                      >
                        Upload Failed
                      </Text>
                      <Text style={{ color: colors.error, fontSize: 14 }}>
                        {error.message}
                      </Text>
                      {error.retryable && (
                        <TouchableOpacity
                          onPress={handleProceed}
                          style={{ marginTop: 8 }}
                        >
                          <Text
                            style={{
                              color: colors.error,
                              fontWeight: "600",
                              textDecorationLine: "underline",
                            }}
                          >
                            Tap to retry
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <TouchableOpacity onPress={clearError}>
                      <Ionicons name="close" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

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
            disabled={isLoading}
            icon={
              <Ionicons
                name="create-outline"
                size={20}
                color={colors.accent.primary}
              />
            }
          />

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
                  How it works
                </Text>
                <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                  1. Take a photo or select a receipt image{"\n"}
                  2. Our AI will read and extract the items{"\n"}
                  3. Review and assign items to your mates{"\n"}
                  {"\n"}
                  Supported: JPG, PNG under 10 MB
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
