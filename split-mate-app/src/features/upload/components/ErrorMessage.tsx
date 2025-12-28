// src/features/upload/components/ErrorMessage.tsx
// Error display component with retry option

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../shared/contexts/ThemeContext";
import { UploadError } from "../../../shared/services/api";

interface ErrorMessageProps {
  error: UploadError;
  onRetry: () => void;
  onDismiss: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  onDismiss,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        marginTop: 16,
        backgroundColor: colors.error + "20",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.error,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <Ionicons
          name="alert-circle"
          size={20}
          color={colors.error}
          style={{ marginRight: 8 }}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.error,
              fontWeight: "600",
              marginBottom: 4,
            }}
          >
            Upload Failed
          </Text>
          <Text style={{ color: colors.error, fontSize: 14 }}>
            {error.message}
          </Text>
          {error.retryable && (
            <TouchableOpacity onPress={onRetry} style={{ marginTop: 8 }}>
              <Text
                style={{
                  color: colors.error,
                  fontWeight: "600",
                  textDecorationLine: "underline",
                }}
              >
                Tap to retry
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={onDismiss}>
          <Ionicons name="close" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
