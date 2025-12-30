import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";
import { ICON_SIZE, SPACING } from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface AssignItemsHeaderProps {
  onBack: () => void;
  onDelete?: () => void;
  showDelete: boolean;
  onShare?: () => void;
  showShare: boolean;
  isSharing?: boolean;
}

export const AssignItemsHeader: React.FC<AssignItemsHeaderProps> = ({
  onBack,
  onDelete,
  showDelete,
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

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete?.();
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
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.lg }}>
        {showShare && onShare && (
          <TouchableOpacity
            onPress={handleShare}
            style={{ padding: SPACING.sm }}
            activeOpacity={0.6}
            disabled={isSharing}
          >
            <Ionicons
              name={isSharing ? "hourglass-outline" : "share-outline"}
              size={ICON_SIZE.xl}
              color={isSharing ? colors.text.secondary : colors.text.primary}
            />
          </TouchableOpacity>
        )}
        {showDelete && onDelete && (
          <TouchableOpacity
            onPress={handleDelete}
            style={{ padding: SPACING.sm }}
            activeOpacity={0.6}
          >
            <Ionicons name="trash" size={ICON_SIZE.xl} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
