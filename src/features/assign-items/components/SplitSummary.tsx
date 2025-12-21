// src/features/assign-items/components/SplitSummary.tsx
// Summary section showing total and per-person breakdown

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface PersonTotal {
  name: string;
  total: number;
}

interface SplitSummaryProps {
  totalAmount: number;
  totals: PersonTotal[];
}

export const SplitSummary: React.FC<SplitSummaryProps> = ({
  totalAmount,
  totals,
}) => {
  const { colors } = useTheme();

  return (
    <View style={{ marginTop: 32 }}>
      <View
        style={{
          backgroundColor: colors.background.secondary,
          borderRadius: 20,
          padding: 24,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: "#000000",
          shadowOpacity: 0.06,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 3,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              backgroundColor: colors.accent.light,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons
              name="pie-chart-outline"
              size={24}
              color={colors.accent.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.text.primary,
                fontWeight: "700",
                fontSize: 24,
              }}
            >
              Split Summary
            </Text>
            <Text
              style={{
                color: colors.text.secondary,
                marginTop: 4,
              }}
            >
              Review the breakdown before you save this receipt.
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: colors.accent.primary,
            borderRadius: 18,
            padding: 20,
            marginBottom: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              style={{
                color: colors.text.inverse,
                opacity: 0.8,
                fontSize: 14,
                fontWeight: "600",
                textTransform: "uppercase",
              }}
            >
              Receipt Total
            </Text>
            <Text
              style={{
                color: colors.text.inverse,
                fontWeight: "800",
                fontSize: 32,
                marginTop: 4,
              }}
            >
              ${totalAmount.toFixed(2)}
            </Text>
          </View>
          <Ionicons
            name="wallet-outline"
            size={32}
            color={colors.text.inverse}
          />
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 12,
              textTransform: "uppercase",
            }}
          >
            How much each person owes
          </Text>
          {totals.map((person) => (
            <View
              key={person.name}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.background.primary,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: colors.accent.light,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Text
                  style={{
                    color: colors.accent.primary,
                    fontWeight: "700",
                    fontSize: 18,
                  }}
                >
                  {person.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.text.primary,
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                >
                  {person.name}
                </Text>
              </View>
              <Text
                style={{
                  color: colors.accent.primary,
                  fontWeight: "700",
                  fontSize: 18,
                }}
              >
                ${person.total.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
