import React from "react";
import { View, ViewStyle } from "react-native";
import { BORDER_RADIUS } from "../../../shared/constants/design";
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
        borderRadius: BORDER_RADIUS.lg,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </View>
  );
};
