// src/features/upload/components/FilePickerButton.tsx
// File picker button component

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface FilePickerButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const FilePickerButton: React.FC<FilePickerButtonProps> = ({
  onPress,
  disabled,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: colors.background.secondary,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        alignItems: "center",
        opacity: disabled ? 0.5 : 1,
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
  );
};
