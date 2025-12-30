import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from "../constants/design";
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
    small: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg },
    medium: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl },
    large: { paddingVertical: SPACING.lg, paddingHorizontal: SPACING["2xl"] },
  };

  const textSizeStyles = {
    small: { fontSize: FONT_SIZE.sm },
    medium: { fontSize: FONT_SIZE.base },
    large: { fontSize: FONT_SIZE.lg },
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
        borderRadius: BORDER_RADIUS.md,
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
          {icon && <View style={{ marginRight: SPACING.sm }}>{icon}</View>}
          <Text
            style={{
              color: getTextColor(),
              fontWeight: FONT_WEIGHT.semibold,
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
