import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { EMPTY_STATE_STYLES, FONT_WEIGHT, SPACING } from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface EmptyMatesStateProps {
  minRequired: number;
}

export const EmptyMatesState: React.FC<EmptyMatesStateProps> = ({
  minRequired,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background.secondary,
        borderRadius: EMPTY_STATE_STYLES.borderRadius,
        padding: EMPTY_STATE_STYLES.padding,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: SPACING["xl"],
      }}
    >
      <Ionicons
        name="people-outline"
        size={EMPTY_STATE_STYLES.iconSize}
        color={colors.text.tertiary}
      />
      <Text
        style={{
          color: colors.text.primary,
          fontWeight: FONT_WEIGHT.semibold,
          fontSize: EMPTY_STATE_STYLES.titleSize,
          marginTop: EMPTY_STATE_STYLES.iconGap,
          textAlign: "center",
        }}
      >
        Add at least {minRequired} mates
      </Text>
      <Text
        style={{
          color: colors.text.secondary,
          marginTop: EMPTY_STATE_STYLES.textGap,
          textAlign: "center",
        }}
      >
        You&apos;ll head to upload after everyone is listed.
      </Text>
    </View>
  );
};
