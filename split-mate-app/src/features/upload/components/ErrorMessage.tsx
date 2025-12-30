import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, ICON_SIZE, SPACING } from "../../../shared/constants/design";
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
        marginTop: SPACING.lg,
        backgroundColor: colors.error + "20",
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: colors.error,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <Ionicons
          name="alert-circle"
          size={ICON_SIZE.md}
          color={colors.error}
          style={{ marginRight: SPACING.sm }}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.error,
              fontWeight: FONT_WEIGHT.semibold,
              marginBottom: SPACING.xs,
            }}
          >
            Upload Failed
          </Text>
          <Text style={{ color: colors.error, fontSize: FONT_SIZE.sm }}>
            {error.message}
          </Text>
          {error.retryable && (
            <TouchableOpacity onPress={onRetry} style={{ marginTop: SPACING.sm }}>
              <Text
                style={{
                  color: colors.error,
                  fontWeight: FONT_WEIGHT.semibold,
                  textDecorationLine: "underline",
                }}
              >
                Tap to retry
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={onDismiss}>
          <Ionicons name="close" size={ICON_SIZE.md} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
