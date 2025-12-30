import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
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
        onPress={onBack}
        style={{ flexDirection: "row", alignItems: "center" }}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={ICON_SIZE.lg} color={colors.text.primary} />
      </TouchableOpacity>
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.lg }}>
        {showShare && onShare && (
          <TouchableOpacity
            onPress={onShare}
            style={{ padding: SPACING.sm }}
            activeOpacity={0.7}
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
            onPress={onDelete}
            style={{ padding: SPACING.sm }}
            activeOpacity={0.7}
          >
            <Ionicons name="trash" size={ICON_SIZE.xl} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
