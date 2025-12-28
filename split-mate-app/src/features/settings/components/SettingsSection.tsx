// src/features/settings/components/SettingsSection.tsx
// Section container with title

import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
}) => {
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "600",
          color: colors.text.primary,
          marginBottom: 16,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
};
