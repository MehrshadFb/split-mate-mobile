// src/features/receipts/components/EmptyReceiptsState.tsx
// Empty state when no receipts have been saved

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../../shared/contexts/ThemeContext";
import { Button } from "../../../shared/components/Button";

interface EmptyReceiptsStateProps {
  onStartNew: () => void;
}

export const EmptyReceiptsState: React.FC<EmptyReceiptsStateProps> = ({
  onStartNew,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.background.secondary,
        borderRadius: 20,
        padding: 32,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Ionicons
        name="archive-outline"
        size={48}
        color={colors.text.tertiary}
      />
      <Text
        style={{
          color: colors.text.primary,
          fontWeight: "600",
          fontSize: 20,
          marginTop: 16,
          textAlign: "center",
        }}
      >
        Nothing saved yet
      </Text>
      <Text
        style={{
          color: colors.text.secondary,
          marginTop: 8,
          textAlign: "center",
        }}
      >
        When you save a split, it appears here for quick access.
      </Text>
      <View style={{ width: "100%", marginTop: 24 }}>
        <Button
          title="Start a new receipt"
          onPress={onStartNew}
          variant="primary"
          size="large"
          fullWidth
          icon={<Ionicons name="sparkles" size={20} color="white" />}
        />
      </View>
    </View>
  );
};
