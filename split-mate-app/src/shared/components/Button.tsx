// src/components/Button.tsx
// Reusable button component with iOS-style design

import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
}: ButtonProps) {
  const { colors } = useTheme();

  const sizeStyles = {
    small: { paddingVertical: 8, paddingHorizontal: 16 },
    medium: { paddingVertical: 12, paddingHorizontal: 24 },
    large: { paddingVertical: 16, paddingHorizontal: 32 },
  };

  const textSizeStyles = {
    small: { fontSize: 14 },
    medium: { fontSize: 16 },
    large: { fontSize: 18 },
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: colors.accent.primary,
          borderWidth: 0,
        };
      case "secondary":
        return {
          backgroundColor: colors.neutral[200],
          borderWidth: 0,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: colors.accent.primary,
        };
      case "danger":
        return {
          backgroundColor: colors.error,
          borderWidth: 0,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "primary":
        return colors.text.inverse;
      case "secondary":
        return colors.text.primary;
      case "outline":
        return colors.accent.primary;
      case "danger":
        return "white";
    }
  };

  return (
    <TouchableOpacity
      style={{
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? "100%" : undefined,
        ...getVariantStyles(),
        ...sizeStyles[size],
      }}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "danger"
              ? "white"
              : colors.accent.primary
          }
        />
      ) : (
        <>
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          <Text
            style={{
              color: getTextColor(),
              fontWeight: "600",
              ...textSizeStyles[size],
            }}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
