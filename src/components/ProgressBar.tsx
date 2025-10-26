// src/components/ProgressBar.tsx
// Progress bar component for upload progress

import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface ProgressBarProps {
  progress: number; // 0-100
  showLabel?: boolean;
  height?: number;
}

export function ProgressBar({
  progress,
  showLabel = true,
  height = 8,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={{ width: "100%" }}>
      <View
        style={{
          width: "100%",
          backgroundColor: colors.neutral[200],
          borderRadius: 999,
          overflow: "hidden",
          height,
        }}
      >
        <View
          style={{
            backgroundColor: colors.accent.primary,
            height: "100%",
            borderRadius: 999,
            width: `${clampedProgress}%`,
          }}
        />
      </View>
      {showLabel && (
        <Text
          style={{
            fontSize: 12,
            color: colors.text.secondary,
            marginTop: 4,
            textAlign: "right",
          }}
        >
          {clampedProgress}%
        </Text>
      )}
    </View>
  );
}
