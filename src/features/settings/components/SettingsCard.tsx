// src/features/settings/components/SettingsCard.tsx
// Card container for grouped settings

import React from "react";
import { View, ViewStyle } from "react-native";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface SettingsCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  children,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.background.secondary,
        borderRadius: 12,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </View>
  );
};
