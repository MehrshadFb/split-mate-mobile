import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";
import { BORDER_RADIUS, ICON_SIZE, SPACING } from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface AssignItemsHeaderProps {
  onBack: () => void;
  onDone: () => void;
  onShare?: () => void;
  showShare: boolean;
  isSharing?: boolean;
}

export const AssignItemsHeader: React.FC<AssignItemsHeaderProps> = ({
  onBack,
  onDone,
  onShare,
  showShare,
  isSharing = false,
}) => {
  const { colors } = useTheme();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack();
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShare?.();
  };

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDone();
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: SPACING["2xl"],
      }}
    >
      <TouchableOpacity
        onPress={handleBack}
        style={{ flexDirection: "row", alignItems: "center" }}
        activeOpacity={0.6}
      >
        <Ionicons name="arrow-back" size={ICON_SIZE.lg} color={colors.text.primary} />
      </TouchableOpacity>
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.md }}>
        {showShare && onShare && (
          <TouchableOpacity
            onPress={handleShare}
            style={{ padding: SPACING.sm }}
            activeOpacity={0.6}
            disabled={isSharing}
            accessibilityRole="button"
            accessibilityLabel="Share receipt"
          >
            <Ionicons
              name={isSharing ? "hourglass-outline" : "share-outline"}
              size={ICON_SIZE.xl}
              color={isSharing ? colors.text.secondary : colors.text.primary}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleDone}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Done"
          style={{
            width: 36,
            height: 36,
            borderRadius: BORDER_RADIUS.full,
            backgroundColor: colors.accent.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="checkmark"
            size={ICON_SIZE.lg}
            color={colors.text.inverse}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
