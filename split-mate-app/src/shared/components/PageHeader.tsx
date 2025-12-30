import React from "react";
import { Text, View } from "react-native";
import { FONT_WEIGHT, HEADER_STYLES } from "../constants/design";
import { useTheme } from "../contexts/ThemeContext";

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: HEADER_STYLES.marginBottom }}>
      <Text
        style={{
          fontSize: HEADER_STYLES.titleSize,
          fontWeight: FONT_WEIGHT.bold,
          color: colors.text.primary,
          marginBottom: HEADER_STYLES.titleGap,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: HEADER_STYLES.subtitleSize,
          color: colors.text.secondary,
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
};
