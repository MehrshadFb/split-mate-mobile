import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, ICON_SIZE, SPACING } from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";

export const InfoCard: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        marginTop: SPACING["3xl"],
        backgroundColor: colors.accent.light,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.lg,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <Ionicons
          name="information-circle"
          size={ICON_SIZE.md}
          color={colors.accent.primary}
        />
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text
            style={{
              color: colors.accent.hover,
              fontWeight: FONT_WEIGHT.semibold,
              marginBottom: SPACING.xs,
            }}
          >
            How it works
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: FONT_SIZE.sm }}>
            1. Take a photo or select a receipt image{"\n"}
            2. Our AI will read and extract the items{"\n"}
            3. Review and assign items to your mates{"\n"}
            {"\n"}
            Supported: JPG, PNG under 10 MB
          </Text>
        </View>
      </View>
    </View>
  );
};
