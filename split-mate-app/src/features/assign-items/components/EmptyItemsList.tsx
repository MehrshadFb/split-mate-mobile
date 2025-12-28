// src/features/assign-items/components/EmptyItemsList.tsx
// Empty state for items list

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../../shared/contexts/ThemeContext";

export const EmptyItemsList: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.background.secondary,
        borderRadius: 12,
        padding: 32,
        alignItems: "center",
        marginBottom: 12,
      }}
    >
      <Ionicons
        name="receipt-outline"
        size={48}
        color={colors.text.tertiary}
      />
      <Text
        style={{
          color: colors.text.primary,
          fontSize: 18,
          fontWeight: "600",
          marginTop: 12,
          textAlign: "center",
        }}
      >
        No Items Yet
      </Text>
      <Text
        style={{
          color: colors.text.secondary,
          textAlign: "center",
          marginTop: 8,
        }}
      >
        Add items manually using the button below
      </Text>
    </View>
  );
};
