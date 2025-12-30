import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { PageHeader } from "../../../shared/components/PageHeader";
import { ICON_SIZE, SPACING } from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface UploadHeaderProps {
  title: string;
  subtitle: string;
  onBack: () => void;
}

export const UploadHeader: React.FC<UploadHeaderProps> = ({
  title,
  subtitle,
  onBack,
}) => {
  const { colors } = useTheme();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack();
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleBack}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: SPACING["2xl"],
        }}
        activeOpacity={0.6}
      >
        <Ionicons name="arrow-back" size={ICON_SIZE.lg} color={colors.text.primary} />
      </TouchableOpacity>
      <PageHeader title={title} subtitle={subtitle} />
    </>
  );
};
