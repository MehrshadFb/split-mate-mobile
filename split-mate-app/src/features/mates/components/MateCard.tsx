import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { AVATAR_SIZE, CARD_STYLES, FONT_SIZE, FONT_WEIGHT, ICON_SIZE, SPACING } from "../../../shared/constants/design";
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
        borderRadius: CARD_STYLES.borderRadius,
        padding: CARD_STYLES.padding,
        marginBottom: CARD_STYLES.marginBottom,
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
            width: AVATAR_SIZE.md,
            height: AVATAR_SIZE.md,
            backgroundColor: colors.accent.light,
            borderRadius: AVATAR_SIZE.md / 2,
            alignItems: "center",
            justifyContent: "center",
            marginRight: SPACING.md,
          }}
        >
          <Text
            style={{
              color: colors.accent.primary,
              fontWeight: FONT_WEIGHT.bold,
            }}
          >
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text
          style={{
            color: colors.text.primary,
            fontWeight: FONT_WEIGHT.medium,
            fontSize: FONT_SIZE.base,
          }}
        >
          {name}
        </Text>
      </View>
      <TouchableOpacity onPress={onRemove} activeOpacity={0.7}>
        <Ionicons name="close" size={ICON_SIZE.md} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
};
