// src/features/assign-items/components/AssignItemsHeader.tsx
// Header component with back button and delete option

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface AssignItemsHeaderProps {
  onBack: () => void;
  onDelete?: () => void;
  showDelete: boolean;
}

export const AssignItemsHeader: React.FC<AssignItemsHeaderProps> = ({
  onBack,
  onDelete,
  showDelete,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
      }}
    >
      <TouchableOpacity
        onPress={onBack}
        className="flex-row items-center"
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>
      {showDelete && onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          style={{ padding: 8 }}
          activeOpacity={0.7}
        >
          <Ionicons name="trash" size={28} color={colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );
};
