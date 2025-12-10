// src/features/upload/components/ImagePreview.tsx
// Image preview component with remove button

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface ImagePreviewProps {
  uri: string;
  onRemove: () => void;
  disabled?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  uri,
  onRemove,
  disabled,
}) => {
  const { colors } = useTheme();

  return (
    <View style={{ marginRight: 12, position: "relative" }}>
      <Image
        source={{ uri }}
        style={{
          width: 128,
          height: 192,
          borderRadius: 12,
        }}
        resizeMode="cover"
      />
      {!disabled && (
        <TouchableOpacity
          onPress={onRemove}
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
  );
};
