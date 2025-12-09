// src/features/mates/components/MatesList.tsx
// List container for all mates

import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../../shared/contexts/ThemeContext";
import { MateCard } from "./MateCard";

interface MatesListProps {
  people: string[];
  onRemove: (name: string) => void;
}

export const MatesList: React.FC<MatesListProps> = ({ people, onRemove }) => {
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: 32 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: colors.text.primary,
          marginBottom: 12,
        }}
      >
        People ({people.length})
      </Text>
      {people.map((person) => (
        <MateCard
          key={person}
          name={person}
          onRemove={() => onRemove(person)}
        />
      ))}
    </View>
  );
};
