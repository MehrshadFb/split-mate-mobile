// src/features/upload/components/UploadHeader.tsx
// Header component for upload screen

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface UploadHeaderProps {
  title: string;
  subtitle: string;
  onBack: () => void;
}

export const UploadHeader: React.FC<UploadHeaderProps> = ({
  title,
  subtitle,
  onBack,
}) => {
  const { colors } = useTheme();

  return (
    <>
      <TouchableOpacity
        onPress={onBack}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 24,
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>
      <View style={{ marginBottom: 32 }}>
        <Text
          style={{
            fontSize: 36,
            fontWeight: "bold",
            color: colors.text.primary,
            marginBottom: 8,
          }}
        >
          {title}
        </Text>
        <Text style={{ fontSize: 18, color: colors.text.secondary }}>
          {subtitle}
        </Text>
      </View>
    </>
  );
};
