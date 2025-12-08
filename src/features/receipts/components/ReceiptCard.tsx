// src/features/receipts/components/ReceiptCard.tsx
// Individual receipt card component

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../contexts/ThemeContext";
import { Invoice } from "../../../types/invoice";

interface ReceiptCardProps {
  invoice: Invoice;
  title: string;
  formattedDate: string;
  onPress: () => void;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({
  invoice,
  title,
  formattedDate,
  onPress,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background.secondary,
        borderRadius: 18,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 16,
          backgroundColor: colors.accent.light,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
        }}
      >
        <Text
          style={{
            color: colors.accent.primary,
            fontWeight: "700",
            fontSize: 20,
          }}
        >
          {invoice.items.length}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.text.primary,
            fontWeight: "700",
            fontSize: 17,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: colors.text.secondary,
            marginTop: 4,
          }}
        >
          {formattedDate}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text
          style={{
            color: colors.accent.primary,
            fontWeight: "700",
            fontSize: 20,
          }}
        >
          ${invoice.totalAmount.toFixed(2)}
        </Text>
        <Text
          style={{
            color: colors.text.tertiary,
            marginTop: 4,
            fontSize: 12,
          }}
        >
          {invoice.people.map((person) => person[0]?.toUpperCase()).join(" · ")}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={22}
        color={colors.text.tertiary}
        style={{ marginLeft: 12 }}
      />
    </TouchableOpacity>
  );
};
