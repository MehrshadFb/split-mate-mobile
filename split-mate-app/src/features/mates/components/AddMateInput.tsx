import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, INPUT_STYLES, SPACING } from "../../../shared/constants/design";
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
    <View style={{ flexDirection: "row", marginBottom: SPACING.xl }}>
      <TextInput
        style={{
          flex: 1,
          backgroundColor: colors.background.secondary,
          borderWidth: INPUT_STYLES.borderWidth,
          borderColor: colors.border,
          borderRadius: INPUT_STYLES.borderRadius,
          paddingHorizontal: INPUT_STYLES.paddingHorizontal,
          paddingVertical: INPUT_STYLES.paddingVertical,
          color: colors.text.primary,
          fontSize: INPUT_STYLES.fontSize,
          marginRight: SPACING.sm,
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
          borderRadius: BORDER_RADIUS.md,
          paddingHorizontal: SPACING["2xl"],
          alignItems: "center",
          justifyContent: "center",
        }}
        activeOpacity={0.7}
      >
        <Text
          style={{
            color: colors.text.inverse,
            fontWeight: FONT_WEIGHT.semibold,
            fontSize: FONT_SIZE.base,
          }}
        >
          Add
        </Text>
      </TouchableOpacity>
    </View>
  );
};
