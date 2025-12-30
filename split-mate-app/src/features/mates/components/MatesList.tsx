import React from "react";
import { Text, View } from "react-native";
import { FONT_WEIGHT, SECTION_STYLES, SPACING } from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";
import { MateCard } from "./MateCard";

interface MatesListProps {
  people: string[];
  onRemove: (name: string) => void;
}

export const MatesList: React.FC<MatesListProps> = ({ people, onRemove }) => {
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: SPACING.sm }}>
      <Text
        style={{
          fontSize: SECTION_STYLES.titleSize,
          fontWeight: FONT_WEIGHT.semibold,
          color: colors.text.primary,
          marginBottom: SECTION_STYLES.titleGap,
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
