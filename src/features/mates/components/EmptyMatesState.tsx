// src/features/mates/components/EmptyMatesState.tsx
// Empty state when no mates have been added

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../../contexts/ThemeContext";

interface EmptyMatesStateProps {
  minRequired: number;
}

export const EmptyMatesState: React.FC<EmptyMatesStateProps> = ({
  minRequired,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background.secondary,
        borderRadius: 16,
        padding: 28,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 32,
      }}
    >
      <Ionicons
        name="people-outline"
        size={36}
        color={colors.text.tertiary}
      />
      <Text
        style={{
          color: colors.text.primary,
          fontWeight: "600",
          fontSize: 18,
          marginTop: 12,
          textAlign: "center",
        }}
      >
        Add at least {minRequired} mates
      </Text>
      <Text
        style={{
          color: colors.text.secondary,
          marginTop: 6,
          textAlign: "center",
        }}
      >
        You'll head to upload after everyone is listed.
      </Text>
    </View>
  );
};
