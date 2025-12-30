import React from "react";
import { Text, TextInput, View } from "react-native";
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface ReceiptTitleEditorProps {
  value: string;
  isEditing: boolean;
  onFocus: () => void;
  onChange: (text: string) => void;
  onBlur: () => void;
}

export const ReceiptTitleEditor: React.FC<ReceiptTitleEditorProps> = ({
  value,
  isEditing,
  onFocus,
  onChange,
  onBlur,
}) => {
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: SPACING["2xl"] }}>
      <Text
        style={{
          fontSize: FONT_SIZE.sm,
          fontWeight: FONT_WEIGHT.semibold,
          color: colors.text.secondary,
          marginBottom: SPACING.sm,
          textTransform: "uppercase",
        }}
      >
        Receipt Name
      </Text>
      <TextInput
        value={value}
        onFocus={onFocus}
        onChangeText={onChange}
        onBlur={onBlur}
        style={{
          fontSize: FONT_SIZE["2xl"],
          fontWeight: FONT_WEIGHT.bold,
          color: colors.text.primary,
          padding: SPACING.lg,
          backgroundColor: colors.background.primary,
          borderRadius: BORDER_RADIUS.md,
          borderWidth: 2,
          borderColor: isEditing ? colors.accent.primary : colors.border,
        }}
        placeholder="Enter receipt name"
        placeholderTextColor={colors.text.secondary}
      />
    </View>
  );
};
