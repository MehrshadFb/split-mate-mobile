// src/features/mates/components/AddMateInput.tsx
// Input field with add button for adding new mates

import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface AddMateInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
}

export const AddMateInput: React.FC<AddMateInputProps> = ({
  value,
  onChangeText,
  onSubmit,
}) => {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: "row", marginBottom: 20 }}>
      <TextInput
        style={{
          flex: 1,
          backgroundColor: colors.background.secondary,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          color: colors.text.primary,
          fontSize: 16,
          marginRight: 8,
        }}
        placeholder="Enter name"
        placeholderTextColor={colors.text.tertiary}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="done"
        autoCapitalize="words"
      />
      <TouchableOpacity
        onPress={onSubmit}
        style={{
          backgroundColor: colors.accent.primary,
          borderRadius: 12,
          paddingHorizontal: 24,
          alignItems: "center",
          justifyContent: "center",
        }}
        activeOpacity={0.7}
      >
        <Text
          style={{
            color: colors.text.inverse,
            fontWeight: "600",
            fontSize: 16,
          }}
        >
          Add
        </Text>
      </TouchableOpacity>
    </View>
  );
};
