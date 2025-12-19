// src/features/upload/components/UploadStatusDisplay.tsx
// Upload status display component with progress tracking

import React from "react";
import { Text, View } from "react-native";
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
          ? `AI is reading receipt ${current}/${total}...`
          : "AI is reading your receipt...";
      case "scanned":
        return "Almost done!";
      default:
        return "Processing...";
    }
  };

  const getStatusSubtitle = () => {
    switch (uploadProgress.status) {
      case "uploading":
        return "Sending image to server";
      case "queued":
        return "Waiting for AI to start";
      case "scanning":
        return "Extracting items and prices";
      case "scanned":
        return "Finalizing results";
      default:
        return "";
    }
  };

  return (
    <View
      style={{
        marginTop: 20,
        marginBottom: 16,
        padding: 16,
        backgroundColor: colors.background.secondary,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: 24,
          marginBottom: 8,
        }}
      >
        {getStatusEmoji()}
      </Text>
      <Text
        style={{
          color: colors.text.primary,
          fontSize: 16,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        {getStatusTitle()}
      </Text>
      <Text
        style={{
          color: colors.text.secondary,
          fontSize: 14,
          marginTop: 4,
          textAlign: "center",
        }}
      >
        {getStatusSubtitle()}
      </Text>
    </View>
  );
};
