import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, ICON_SIZE, SPACING } from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";

export const AppInfoCard: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.accent.light,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.lg,
        marginTop: SPACING.lg,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <Ionicons name="sparkles" size={ICON_SIZE.md} color={colors.accent.primary} />
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text
            style={{
              color: colors.accent.hover,
              fontWeight: FONT_WEIGHT.semibold,
              marginBottom: SPACING.xs,
            }}
          >
            About SplitMate
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: FONT_SIZE.sm }}>
            Split bills fairly in seconds. Just upload a receipt, assign items, and let it do the math.
          </Text>
        </View>
      </View>
    </View>
  );
};
