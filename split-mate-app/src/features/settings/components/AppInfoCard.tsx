// src/features/settings/components/AppInfoCard.tsx
// Informational card about the app

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../../shared/contexts/ThemeContext";

export const AppInfoCard: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.accent.light,
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <Ionicons name="sparkles" size={20} color={colors.accent.primary} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{
              color: colors.accent.hover,
              fontWeight: "600",
              marginBottom: 4,
            }}
          >
            About SplitMate
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
            SplitMate uses AI to help you split bills fairly. Upload receipts,
            assign items, and see who owes what - all in seconds.
          </Text>
        </View>
      </View>
    </View>
  );
};
