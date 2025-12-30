import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image, TouchableOpacity, View } from "react-native";
import { BORDER_RADIUS, ICON_SIZE, SPACING } from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface ImagePreviewProps {
  uri: string;
  onRemove: () => void;
  disabled?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  uri,
  onRemove,
  disabled,
}) => {
  const { colors } = useTheme();

  return (
    <View style={{ marginRight: SPACING.md, position: "relative" }}>
      <Image
        source={{ uri }}
        style={{
          width: 128,
          height: 192,
          borderRadius: BORDER_RADIUS.md,
        }}
        resizeMode="cover"
      />
      {!disabled && (
        <TouchableOpacity
          onPress={onRemove}
          style={{
            position: "absolute",
            top: SPACING.sm,
            right: SPACING.sm,
            backgroundColor: colors.error,
            borderRadius: BORDER_RADIUS.md,
            width: SPACING["2xl"],
            height: SPACING["2xl"],
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="close" size={ICON_SIZE.sm} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};
