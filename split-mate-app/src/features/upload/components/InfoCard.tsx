// src/features/upload/components/InfoCard.tsx
// Information card about upload process

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../../shared/contexts/ThemeContext";

export const InfoCard: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        marginTop: 32,
        backgroundColor: colors.accent.light,
        borderRadius: 12,
        padding: 16,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <Ionicons
          name="information-circle"
          size={20}
          color={colors.accent.primary}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{
              color: colors.accent.hover,
              fontWeight: "600",
              marginBottom: 4,
            }}
          >
            How it works
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
            1. Take a photo or select a receipt image{"\n"}
            2. Our AI will read and extract the items{"\n"}
            3. Review and assign items to your mates{"\n"}
            {"\n"}
            Supported: JPG, PNG under 10 MB
          </Text>
        </View>
      </View>
    </View>
  );
};
