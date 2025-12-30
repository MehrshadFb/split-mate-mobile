import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { AVATAR_SIZE, BORDER_RADIUS, CARD_STYLES, FONT_SIZE, FONT_WEIGHT, ICON_SIZE, SPACING } from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";
import { Invoice } from "../../../shared/types/invoice";

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
        borderRadius: CARD_STYLES.borderRadius,
        padding: CARD_STYLES.padding,
        marginBottom: CARD_STYLES.marginBottom,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          width: AVATAR_SIZE.lg,
          height: AVATAR_SIZE.lg,
          borderRadius: BORDER_RADIUS.lg,
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
            fontSize: FONT_SIZE.xl,
          }}
        >
          {invoice.items.length}
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
          {title}
        </Text>
        <Text
          style={{
            color: colors.text.secondary,
            marginTop: SPACING.xs,
          }}
        >
          {formattedDate}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text
          style={{
            color: colors.accent.primary,
            fontWeight: FONT_WEIGHT.bold,
            fontSize: FONT_SIZE.xl,
          }}
        >
          ${invoice.totalAmount.toFixed(2)}
        </Text>
        <Text
          style={{
            color: colors.text.tertiary,
            marginTop: SPACING.xs,
            fontSize: FONT_SIZE.xs,
          }}
        >
          {invoice.people.map((person) => person[0]?.toUpperCase()).join(" · ")}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={ICON_SIZE.md + 2}
        color={colors.text.tertiary}
        style={{ marginLeft: SPACING.md }}
      />
    </TouchableOpacity>
  );
};
