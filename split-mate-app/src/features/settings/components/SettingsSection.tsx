import React from "react";
import { Text, View } from "react-native";
import { FONT_WEIGHT, SECTION_STYLES } from "../../../shared/constants/design";
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
    <View style={{ marginBottom: SECTION_STYLES.marginBottom }}>
      <Text
        style={{
          fontSize: SECTION_STYLES.titleSize,
          fontWeight: FONT_WEIGHT.semibold,
          color: colors.text.primary,
          marginBottom: SECTION_STYLES.titleGap,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
};
