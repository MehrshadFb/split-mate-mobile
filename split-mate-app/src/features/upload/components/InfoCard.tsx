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
            1. Upload a photo of your receipt{"\n"}
            2. AI extracts all items and prices{"\n"}
            3. Assign items and see who owes what{"\n"}
            {"\n"}
            Accepts JPG & PNG up to 10 MB
          </Text>
        </View>
      </View>
    </View>
  );
};
