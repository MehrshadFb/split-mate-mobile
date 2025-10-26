// src/components/LoadingSpinner.tsx
// Loading spinner component

import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "large";
}

export function LoadingSpinner({
  message,
  size = "large",
}: LoadingSpinnerProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <ActivityIndicator size={size} color="#D97757" />
      {message && (
        <Text className="text-text-secondary text-center mt-4">{message}</Text>
      )}
    </View>
  );
}
