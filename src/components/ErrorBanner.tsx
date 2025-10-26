// src/components/ErrorBanner.tsx
// Error banner with retry action

import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryCount?: number;
}

export function ErrorBanner({
  message,
  onRetry,
  onDismiss,
  retryCount,
}: ErrorBannerProps) {
  const { colors, colorScheme } = useTheme();

  const errorBgColor = colorScheme === "dark" ? "#7F1D1D" : "#FEE2E2";
  const errorBorderColor = colorScheme === "dark" ? "#991B1B" : "#FECACA";
  const errorTextColor = colorScheme === "dark" ? "#FCA5A5" : "#991B1B";
  const errorSubTextColor = colorScheme === "dark" ? "#F87171" : "#DC2626";

  return (
    <View
      style={{
        backgroundColor: errorBgColor,
        borderWidth: 1,
        borderColor: errorBorderColor,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <View className="flex-row items-start">
        <View className="flex-1">
          <Text
            style={{
              color: errorTextColor,
              fontWeight: "600",
              marginBottom: 4,
            }}
          >
            Error
          </Text>
          <Text style={{ color: errorSubTextColor, fontSize: 14 }}>
            {message}
          </Text>
          {retryCount !== undefined && retryCount > 0 && (
            <Text
              style={{ color: errorSubTextColor, fontSize: 12, marginTop: 4 }}
            >
              Attempted {retryCount} time{retryCount > 1 ? "s" : ""}
            </Text>
          )}
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} className="ml-2">
            <Text
              style={{
                color: errorSubTextColor,
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              ×
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={{
            marginTop: 12,
            backgroundColor: colors.error,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
          }}
        >
          <Text
            style={{ color: "white", fontWeight: "600", textAlign: "center" }}
          >
            Retry
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
