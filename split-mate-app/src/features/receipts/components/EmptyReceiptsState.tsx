import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { Button } from "../../../shared/components/Button";
import { EMPTY_STATE_STYLES, FONT_WEIGHT, ICON_SIZE, SPACING } from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface EmptyReceiptsStateProps {
  onStartNew: () => void;
}

export const EmptyReceiptsState: React.FC<EmptyReceiptsStateProps> = ({
  onStartNew,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.background.secondary,
        borderRadius: EMPTY_STATE_STYLES.borderRadius,
        padding: EMPTY_STATE_STYLES.padding,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Ionicons
        name="archive-outline"
        size={EMPTY_STATE_STYLES.iconSize}
        color={colors.text.tertiary}
      />
      <Text
        style={{
          color: colors.text.primary,
          fontWeight: FONT_WEIGHT.semibold,
          fontSize: EMPTY_STATE_STYLES.titleSize,
          marginTop: SPACING.lg,
          textAlign: "center",
        }}
      >
        No receipts yet
      </Text>
      <Text
        style={{
          color: colors.text.secondary,
          marginTop: EMPTY_STATE_STYLES.textGap,
          textAlign: "center",
        }}
      >
        Your saved splits will appear here.
      </Text>
      <View style={{ width: "100%", marginTop: SPACING["2xl"] }}>
        <Button
          title="Split Your First Bill"
          onPress={onStartNew}
          variant="primary"
          size="large"
          fullWidth
          icon={<Ionicons name="sparkles" size={ICON_SIZE.md} color="white" />}
        />
      </View>
    </View>
  );
};
