import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { AVATAR_SIZE, BORDER_RADIUS, CARD_STYLES, FONT_SIZE, FONT_WEIGHT, ICON_SIZE, SPACING } from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";
import { Invoice } from "../../../shared/types/invoice";
import { getPaymentProgress } from "../../../shared/utils/paymentStatus";

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
  const paymentProgress = getPaymentProgress(invoice);
  const paymentLabel =
    paymentProgress.owedCount === 0
      ? "No payment due"
      : paymentProgress.isPaid
      ? "Paid"
      : `${paymentProgress.paidCount}/${paymentProgress.owedCount} paid`;
  const paymentStatusColor = colors.accent.primary;
  const paymentPillBackground =
    paymentProgress.owedCount === 0
      ? colors.neutral[100]
      : colors.accent.light;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <RectButton
      onPress={handlePress}
      activeOpacity={0.7}
      underlayColor={colors.neutral[200]}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background.secondary,
        borderRadius: CARD_STYLES.borderRadius,
        padding: CARD_STYLES.padding,
        marginBottom: CARD_STYLES.marginBottom,
        borderWidth: 1,
        borderColor: paymentProgress.isPaid
          ? colors.accent.primary
          : colors.border,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: AVATAR_SIZE.lg,
          height: AVATAR_SIZE.lg,
          borderRadius: BORDER_RADIUS.lg,
          backgroundColor: paymentProgress.isPaid
            ? colors.accent.primary
            : colors.accent.light,
          alignItems: "center",
          justifyContent: "center",
          marginRight: SPACING.md,
        }}
      >
        {paymentProgress.isPaid ? (
          <Ionicons
            name="checkmark"
            size={ICON_SIZE.lg}
            color={colors.text.inverse}
          />
        ) : (
          <Text
            style={{
              color: colors.accent.primary,
              fontWeight: FONT_WEIGHT.bold,
              fontSize: FONT_SIZE.xl,
            }}
          >
            {invoice.items.length}
          </Text>
        )}
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
        <View
          style={{
            backgroundColor: paymentPillBackground,
            borderRadius: BORDER_RADIUS.full,
            paddingHorizontal: SPACING.sm,
            paddingVertical: SPACING.xs,
            marginTop: SPACING.xs,
          }}
        >
          <Text
            style={{
              color:
                paymentProgress.owedCount === 0
                  ? colors.text.tertiary
                  : paymentStatusColor,
              fontSize: FONT_SIZE.xs,
              fontWeight: FONT_WEIGHT.semibold,
            }}
          >
            {paymentLabel}
          </Text>
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={ICON_SIZE.md + 2}
        color={colors.text.tertiary}
        style={{ marginLeft: SPACING.md }}
      />
    </RectButton>
  );
};
