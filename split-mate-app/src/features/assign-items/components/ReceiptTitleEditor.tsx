// src/features/assign-items/components/ReceiptTitleEditor.tsx
// Editable receipt title input

import React from "react";
import { Text, TextInput, View } from "react-native";
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
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: colors.text.secondary,
          marginBottom: 8,
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
          fontSize: 24,
          fontWeight: "700",
          color: colors.text.primary,
          padding: 16,
          backgroundColor: colors.background.primary,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: isEditing ? colors.accent.primary : colors.border,
        }}
        placeholder="Enter receipt name"
        placeholderTextColor={colors.text.secondary}
      />
    </View>
  );
};
