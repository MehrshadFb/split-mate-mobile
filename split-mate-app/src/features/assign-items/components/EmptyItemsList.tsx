import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { EMPTY_STATE_STYLES, FONT_WEIGHT, SPACING } from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";

export const EmptyItemsList: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.background.secondary,
        borderRadius: EMPTY_STATE_STYLES.borderRadius,
        padding: EMPTY_STATE_STYLES.padding,
        alignItems: "center",
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Ionicons
        name="receipt-outline"
        size={EMPTY_STATE_STYLES.iconSize}
        color={colors.text.tertiary}
      />
      <Text
        style={{
          color: colors.text.primary,
          fontSize: EMPTY_STATE_STYLES.titleSize,
          fontWeight: FONT_WEIGHT.semibold,
          marginTop: EMPTY_STATE_STYLES.iconGap,
          textAlign: "center",
        }}
      >
        No Items Yet
      </Text>
      <Text
        style={{
          color: colors.text.secondary,
          textAlign: "center",
          marginTop: EMPTY_STATE_STYLES.textGap,
        }}
      >
        Add items manually using the button below
      </Text>
    </View>
  );
};
