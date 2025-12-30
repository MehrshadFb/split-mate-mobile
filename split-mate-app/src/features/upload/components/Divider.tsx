import React from "react";
import { Text, View } from "react-native";
import { FONT_SIZE, SPACING } from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface DividerProps {
  text?: string;
}

export const Divider: React.FC<DividerProps> = ({ text = "or" }) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginVertical: SPACING["2xl"],
      }}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      <Text
        style={{
          color: colors.text.tertiary,
          fontSize: FONT_SIZE.sm,
          marginHorizontal: SPACING.lg,
        }}
      >
        {text}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
    </View>
  );
};
