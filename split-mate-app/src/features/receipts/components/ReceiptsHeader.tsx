// src/features/receipts/components/ReceiptsHeader.tsx
// Header component for receipts screen

import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface ReceiptsHeaderProps {
  title: string;
  subtitle: string;
}

export const ReceiptsHeader: React.FC<ReceiptsHeaderProps> = ({
  title,
  subtitle,
}) => {
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: 24 }}>
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
  );
};
