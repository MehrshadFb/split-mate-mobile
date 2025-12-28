// src/features/mates/components/MateCard.tsx
// Individual mate card with avatar and remove button

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface MateCardProps {
  name: string;
  onRemove: () => void;
}

export const MateCard: React.FC<MateCardProps> = ({ name, onRemove }) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.background.secondary,
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            backgroundColor: colors.accent.light,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Text
            style={{
              color: colors.accent.primary,
              fontWeight: "bold",
            }}
          >
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text
          style={{
            color: colors.text.primary,
            fontWeight: "500",
            fontSize: 16,
          }}
        >
          {name}
        </Text>
      </View>
      <TouchableOpacity onPress={onRemove} activeOpacity={0.7}>
        <Ionicons name="close" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
};
