import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, ICON_SIZE, SPACING } from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface CameraButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const CameraButton: React.FC<CameraButtonProps> = ({
  onPress,
  disabled,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: colors.accent.primary,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING["2xl"],
        marginBottom: SPACING.lg,
        alignItems: "center",
        opacity: disabled ? 0.5 : 1,
      }}
      activeOpacity={0.7}
    >
      <Ionicons name="camera" size={ICON_SIZE["3xl"]} color={colors.text.inverse} />
      <Text
        style={{
          color: colors.text.inverse,
          fontWeight: FONT_WEIGHT.bold,
          fontSize: FONT_SIZE.lg,
          marginTop: SPACING.md,
        }}
      >
        Take Photo
      </Text>
      <Text
        style={{
          color: colors.text.inverse,
          fontSize: FONT_SIZE.sm,
          marginTop: SPACING.xs,
          opacity: 0.8,
        }}
      >
        Snap a quick photo of your receipt
      </Text>
    </TouchableOpacity>
  );
};
