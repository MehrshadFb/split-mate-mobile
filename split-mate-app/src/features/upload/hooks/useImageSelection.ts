import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { validateFile } from "../utils/fileValidation";

export interface SelectedImage {
  uri: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
}

export const useImageSelection = () => {
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);

  const handleTakePhoto = useCallback(async () => {
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
        const isValid = validateFile(asset.uri, mimeType, asset.fileSize);
        if (isValid) {
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
  }, []);

  const handleChooseFromLibrary = useCallback(async () => {
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
        const isValid = validateFile(asset.uri, mimeType, asset.fileSize);
        if (isValid) {
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
  }, []);

  const removeImage = useCallback((index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearImages = useCallback(() => {
    setSelectedImages([]);
  }, []);

  return {
    selectedImages,
    handleTakePhoto,
    handleChooseFromLibrary,
    removeImage,
    clearImages,
  };
};
