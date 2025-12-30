import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { AVATAR_SIZE, BORDER_RADIUS, CARD_STYLES, FONT_SIZE, FONT_WEIGHT, ICON_SIZE, SPACING } from "../../../shared/constants/design";
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
    <View style={{ marginTop: SPACING["2xl"] }}>
      <View
        style={{
          backgroundColor: colors.background.secondary,
          borderRadius: BORDER_RADIUS.xl,
          padding: SPACING.xl,
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
            marginBottom: SPACING.xl,
          }}
        >
          <View
            style={{
              width: ICON_SIZE["3xl"],
              height: ICON_SIZE["3xl"],
              borderRadius: BORDER_RADIUS.lg,
              backgroundColor: colors.accent.light,
              alignItems: "center",
              justifyContent: "center",
              marginRight: SPACING.md,
            }}
          >
            <Ionicons
              name="pie-chart-outline"
              size={ICON_SIZE.lg}
              color={colors.accent.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.text.primary,
                fontWeight: FONT_WEIGHT.bold,
                fontSize: FONT_SIZE["2xl"],
              }}
            >
              Split Summary
            </Text>
            <Text
              style={{
                color: colors.text.secondary,
                marginTop: SPACING.xs,
                fontSize: FONT_SIZE.sm,
              }}
            >
              Here's what everyone owes.
            </Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: colors.accent.primary,
            borderRadius: BORDER_RADIUS.lg + 2,
            padding: SPACING.xl,
            marginBottom: SPACING.xl,
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
                fontSize: FONT_SIZE.sm,
                fontWeight: FONT_WEIGHT.semibold,
                textTransform: "uppercase",
              }}
            >
              Receipt Total
            </Text>
            <Text
              style={{
                color: colors.text.inverse,
                fontWeight: FONT_WEIGHT.extrabold,
                fontSize: FONT_SIZE["3xl"] + 4,
                marginTop: SPACING.xs,
              }}
            >
              ${totalAmount.toFixed(2)}
            </Text>
          </View>
          <Ionicons
            name="wallet-outline"
            size={ICON_SIZE["2xl"]}
            color={colors.text.inverse}
          />
        </View>
        <View style={{ marginBottom: SPACING.md }}>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: FONT_SIZE.sm,
              fontWeight: FONT_WEIGHT.semibold,
              marginBottom: SPACING.md,
              textTransform: "uppercase",
            }}
          >
            Individual Totals
          </Text>
          {totals.map((person) => (
            <View
              key={person.name}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.background.primary,
                borderRadius: CARD_STYLES.borderRadius,
                padding: CARD_STYLES.padding,
                marginBottom: CARD_STYLES.marginBottom,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  width: AVATAR_SIZE.md + 4,
                  height: AVATAR_SIZE.md + 4,
                  borderRadius: BORDER_RADIUS.md,
                  backgroundColor: colors.accent.light,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: SPACING.md,
                }}
              >
                <Text
                  style={{
                    color: colors.accent.primary,
                    fontWeight: FONT_WEIGHT.bold,
                    fontSize: FONT_SIZE.lg,
                  }}
                >
                  {person.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.text.primary,
                    fontWeight: FONT_WEIGHT.bold,
                    fontSize: FONT_SIZE.base,
                  }}
                >
                  {person.name}
                </Text>
              </View>
              <Text
                style={{
                  color: colors.accent.primary,
                  fontWeight: FONT_WEIGHT.bold,
                  fontSize: FONT_SIZE.lg,
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
