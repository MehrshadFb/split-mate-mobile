import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { FONT_SIZE, FONT_WEIGHT, ICON_SIZE, SPACING } from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  showBorder?: boolean;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  value,
  subtitle,
  onPress,
  showChevron = false,
  showBorder = true,
}) => {
  const { colors } = useTheme();

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: SPACING.lg,
        ...(showBorder && {
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }),
      }}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
        }}
      >
        <Ionicons name={icon} size={ICON_SIZE.lg} color={colors.accent.primary} />
        <View style={{ marginLeft: SPACING.md, flex: 1 }}>
          <Text
            style={{
              color: colors.text.primary,
              fontWeight: FONT_WEIGHT.medium,
              fontSize: FONT_SIZE.base,
            }}
          >
            {label}
          </Text>
          {subtitle && (
            <Text
              style={{
                color: colors.text.tertiary,
                fontSize: FONT_SIZE.xs,
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
        {value && (
          <Text style={{ color: colors.text.secondary }}>{value}</Text>
        )}
        {showChevron && (
          <Ionicons
            name="open-outline"
            size={ICON_SIZE.md}
            color={colors.text.tertiary}
          />
        )}
      </View>
    </Component>
  );
};
