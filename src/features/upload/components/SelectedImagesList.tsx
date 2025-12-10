// src/features/upload/components/SelectedImagesList.tsx
// List of selected images with preview

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Button } from "../../../shared/components/Button";
import { useTheme } from "../../../shared/contexts/ThemeContext";
import { ImagePreview } from "./ImagePreview";

interface SelectedImage {
  uri: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
}

interface SelectedImagesListProps {
  images: SelectedImage[];
  onRemoveImage: (index: number) => void;
  onProceed: () => void;
  isLoading: boolean;
}

export const SelectedImagesList: React.FC<SelectedImagesListProps> = ({
  images,
  onRemoveImage,
  onProceed,
  isLoading,
}) => {
  const { colors } = useTheme();

  if (images.length === 0) return null;

  return (
    <View style={{ marginTop: 24 }}>
      <Text
        style={{
          color: colors.text.primary,
          fontWeight: "600",
          marginBottom: 12,
        }}
      >
        Selected Receipts ({images.length})
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {images.map((image, index) => (
          <ImagePreview
            key={index}
            uri={image.uri}
            onRemove={() => onRemoveImage(index)}
            disabled={isLoading}
          />
        ))}
      </ScrollView>
      <View style={{ marginTop: 16 }}>
        <Button
          title={
            isLoading
              ? "Processing..."
              : `Proceed with ${images.length} Receipt${
                  images.length > 1 ? "s" : ""
                }`
          }
          onPress={onProceed}
          variant="primary"
          size="large"
          fullWidth
          disabled={images.length === 0}
          loading={isLoading}
          icon={
            !isLoading ? (
              <Ionicons name="sparkles" size={20} color={colors.text.inverse} />
            ) : undefined
          }
        />
      </View>
    </View>
  );
};
