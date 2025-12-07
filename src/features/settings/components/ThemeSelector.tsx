// src/features/settings/components/ThemeSelector.tsx
// Theme selection component

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../contexts/ThemeContext";
import { SettingsCard } from "./SettingsCard";

export const ThemeSelector: React.FC = () => {
  const { theme, colorScheme, setTheme, colors } = useTheme();

  const handleThemeChange = async (newTheme: "light" | "dark" | "auto") => {
    try {
      await setTheme(newTheme);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  const themeOptions = [
    {
      id: "light" as const,
      icon: "sunny" as const,
      label: "Light",
      subtitle: undefined,
    },
    {
      id: "dark" as const,
      icon: "moon" as const,
      label: "Dark",
      subtitle: undefined,
    },
    {
      id: "auto" as const,
      icon: "phone-portrait" as const,
      label: "Automatic",
      subtitle:
        theme === "auto" ? `Currently ${colorScheme}` : "Match system settings",
    },
  ];

  return (
    <SettingsCard>
      {themeOptions.map((option, index) => (
        <TouchableOpacity
          key={option.id}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            ...(index < themeOptions.length - 1 && {
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }),
          }}
          activeOpacity={0.7}
          onPress={() => handleThemeChange(option.id)}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
            }}
          >
            <Ionicons
              name={option.icon}
              size={24}
              color={colors.accent.primary}
            />
            <View style={{ marginLeft: 12 }}>
              <Text
                style={{
                  color: colors.text.primary,
                  fontWeight: "500",
                  fontSize: 16,
                }}
              >
                {option.label}
              </Text>
              {option.subtitle && (
                <Text
                  style={{
                    color: colors.text.tertiary,
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {option.subtitle}
                </Text>
              )}
            </View>
          </View>
          {theme === option.id && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colors.accent.primary}
            />
          )}
        </TouchableOpacity>
      ))}
    </SettingsCard>
  );
};
