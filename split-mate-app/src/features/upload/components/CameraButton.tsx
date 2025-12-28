// src/features/upload/components/CameraButton.tsx
// Camera capture button component

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface CameraButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const CameraButton: React.FC<CameraButtonProps> = ({
  onPress,
  disabled,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: colors.accent.primary,
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        alignItems: "center",
        opacity: disabled ? 0.5 : 1,
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
  );
};
