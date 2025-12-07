// src/features/settings/components/SettingsItem.tsx
// Reusable settings item component

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../contexts/ThemeContext";

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
        padding: 16,
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
        <Ionicons name={icon} size={24} color={colors.accent.primary} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text
            style={{
              color: colors.text.primary,
              fontWeight: "500",
              fontSize: 16,
            }}
          >
            {label}
          </Text>
          {subtitle && (
            <Text
              style={{
                color: colors.text.tertiary,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {value && (
          <Text style={{ color: colors.text.secondary }}>{value}</Text>
        )}
        {showChevron && (
          <Ionicons
            name="open-outline"
            size={20}
            color={colors.text.tertiary}
          />
        )}
      </View>
    </Component>
  );
};
