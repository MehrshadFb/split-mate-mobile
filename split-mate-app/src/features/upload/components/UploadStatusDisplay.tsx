import React from "react";
import { Text, View } from "react-native";
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";
import { UploadProgress } from "../../../shared/services/api";

interface UploadStatusDisplayProps {
  uploadProgress: UploadProgress;
}

export const UploadStatusDisplay: React.FC<UploadStatusDisplayProps> = ({
  uploadProgress,
}) => {
  const { colors } = useTheme();

  const getStatusEmoji = () => {
    switch (uploadProgress.status) {
      case "uploading":
        return "📤";
      case "queued":
        return "⏳";
      case "scanning":
        return "🤖";
      case "scanned":
        return "✨";
      default:
        return "📤";
    }
  };

  const getStatusTitle = () => {
    const { status, current, total } = uploadProgress;
    const isMultiple = total > 1;

    switch (status) {
      case "uploading":
        return isMultiple
          ? `Uploading receipt ${current}/${total}...`
          : "Uploading receipt...";
      case "queued":
        return isMultiple
          ? `Queued for processing (${current}/${total})...`
          : "Queued for processing...";
      case "scanning":
        return isMultiple
          ? `Reading receipt ${current} of ${total}...`
          : "Reading your receipt...";
      case "scanned":
        return "Almost done!";
      default:
        return "Processing...";
    }
  };

  const getStatusSubtitle = () => {
    switch (uploadProgress.status) {
      case "uploading":
        return "Uploading your image...";
      case "queued":
        return "Almost ready to scan";
      case "scanning":
        return "Finding items and prices";
      case "scanned":
        return "Wrapping up";
      default:
        return "";
    }
  };

  return (
    <View
      style={{
        marginTop: SPACING.xl,
        marginBottom: SPACING.lg,
        padding: SPACING.lg,
        backgroundColor: colors.background.secondary,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: FONT_SIZE["2xl"],
          marginBottom: SPACING.sm,
        }}
      >
        {getStatusEmoji()}
      </Text>
      <Text
        style={{
          color: colors.text.primary,
          fontSize: FONT_SIZE.base,
          fontWeight: FONT_WEIGHT.semibold,
          textAlign: "center",
        }}
      >
        {getStatusTitle()}
      </Text>
      <Text
        style={{
          color: colors.text.secondary,
          fontSize: FONT_SIZE.sm,
          marginTop: SPACING.xs,
          textAlign: "center",
        }}
      >
        {getStatusSubtitle()}
      </Text>
    </View>
  );
};
