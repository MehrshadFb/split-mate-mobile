import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";
import { AVATAR_SIZE, BORDER_RADIUS, ICON_SIZE, SPACING } from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface AssignItemsHeaderProps {
  onBack: () => void;
  onDone: () => void;
  showDone: boolean;
  onShare?: () => void;
  showShare: boolean;
  isSharing?: boolean;
}

export const AssignItemsHeader: React.FC<AssignItemsHeaderProps> = ({
  onBack,
  onDone,
  showDone,
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
        marginBottom: SPACING.md,
      }}
    >
      <TouchableOpacity
        onPress={handleBack}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={{
          width: AVATAR_SIZE.md,
          height: AVATAR_SIZE.md,
          alignItems: "center",
          justifyContent: "center",
          marginLeft: -SPACING.sm,
        }}
      >
        <Ionicons name="arrow-back" size={ICON_SIZE.lg} color={colors.text.primary} />
      </TouchableOpacity>
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.md }}>
        {showShare && onShare && (
          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.6}
            disabled={isSharing}
            accessibilityRole="button"
            accessibilityLabel="Share receipt"
            style={{
              width: AVATAR_SIZE.md,
              height: AVATAR_SIZE.md,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name={isSharing ? "hourglass-outline" : "share-outline"}
              size={ICON_SIZE.lg}
              color={isSharing ? colors.text.secondary : colors.text.primary}
            />
          </TouchableOpacity>
        )}
        {showDone && (
          <TouchableOpacity
            onPress={handleDone}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Done"
            style={{
              width: AVATAR_SIZE.md,
              height: AVATAR_SIZE.md,
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
        )}
      </View>
    </View>
  );
};
