// src/features/upload/components/Divider.tsx
// Divider component with text

import React from "react";
import { Text, View } from "react-native";
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
        marginVertical: 24,
      }}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      <Text
        style={{
          color: colors.text.tertiary,
          fontSize: 14,
          marginHorizontal: 16,
        }}
      >
        {text}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
    </View>
  );
};
