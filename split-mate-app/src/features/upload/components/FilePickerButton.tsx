import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, ICON_SIZE, SPACING } from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface FilePickerButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const FilePickerButton: React.FC<FilePickerButtonProps> = ({
  onPress,
  disabled,
}) => {
  const { colors } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={{
        backgroundColor: colors.background.secondary,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING["2xl"],
        alignItems: "center",
        opacity: disabled ? 0.5 : 1,
      }}
      activeOpacity={0.8}
    >
      <Ionicons name="image" size={ICON_SIZE["3xl"]} color={colors.accent.primary} />
      <Text
        style={{
          color: colors.text.primary,
          fontWeight: FONT_WEIGHT.bold,
          fontSize: FONT_SIZE.lg,
          marginTop: SPACING.md,
        }}
      >
        Choose from Library
      </Text>
      <Text
        style={{
          color: colors.text.secondary,
          fontSize: FONT_SIZE.sm,
          marginTop: SPACING.xs,
        }}
      >
        Pick a photo from your gallery
      </Text>
    </TouchableOpacity>
  );
};
