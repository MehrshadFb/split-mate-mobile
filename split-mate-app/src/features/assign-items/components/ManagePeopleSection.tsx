import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { AVATAR_SIZE, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, ICON_SIZE, SPACING } from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface ManagePeopleSectionProps {
  people: string[];
  isExpanded: boolean;
  newPersonName: string;
  onToggleExpanded: () => void;
  onNewPersonNameChange: (name: string) => void;
  onAddPerson: () => void;
  onRemovePerson: (name: string) => void;
}

export const ManagePeopleSection: React.FC<ManagePeopleSectionProps> = ({
  people,
  isExpanded,
  newPersonName,
  onToggleExpanded,
  onNewPersonNameChange,
  onAddPerson,
  onRemovePerson,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.background.secondary,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
      }}
    >
      <TouchableOpacity
        onPress={onToggleExpanded}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: SPACING.lg + 2,
          backgroundColor: colors.background.secondary,
        }}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: AVATAR_SIZE.md,
              height: AVATAR_SIZE.md,
              backgroundColor: colors.accent.light,
              borderRadius: BORDER_RADIUS.md,
              alignItems: "center",
              justifyContent: "center",
              marginRight: SPACING.md,
            }}
          >
            <Ionicons name="people" size={ICON_SIZE.md + 2} color={colors.accent.primary} />
          </View>
          <View>
            <Text
              style={{
                color: colors.text.primary,
                fontWeight: FONT_WEIGHT.bold,
                fontSize: FONT_SIZE.base,
              }}
            >
              Manage People
            </Text>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: FONT_SIZE.xs + 1,
                marginTop: 2,
              }}
            >
              {people.length} {people.length === 1 ? "person" : "people"}
            </Text>
          </View>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={ICON_SIZE.lg}
          color={colors.text.tertiary}
        />
      </TouchableOpacity>
      {isExpanded && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            padding: SPACING.lg + 2,
          }}
        >
          <View style={{ marginBottom: SPACING.xl }}>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: FONT_SIZE.xs + 1,
                fontWeight: FONT_WEIGHT.semibold,
                marginBottom: SPACING.md - 2,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Add New Person
            </Text>
            <View style={{ flexDirection: "row" }}>
              <TextInput
                style={{
                  flex: 1,
                  backgroundColor: colors.background.primary,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: BORDER_RADIUS.md,
                  paddingHorizontal: SPACING.md + 2,
                  paddingVertical: SPACING.md,
                  color: colors.text.primary,
                  fontSize: FONT_SIZE.base,
                  marginRight: SPACING.md - 2,
                }}
                placeholder="Enter name"
                placeholderTextColor={colors.text.tertiary}
                value={newPersonName}
                onChangeText={onNewPersonNameChange}
                onSubmitEditing={onAddPerson}
                returnKeyType="done"
                autoCapitalize="words"
              />
              <TouchableOpacity
                onPress={onAddPerson}
                style={{
                  backgroundColor: colors.accent.primary,
                  borderRadius: BORDER_RADIUS.md,
                  paddingHorizontal: SPACING["2xl"],
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 70,
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    color: colors.text.inverse,
                    fontWeight: FONT_WEIGHT.bold,
                    fontSize: FONT_SIZE.sm + 1,
                  }}
                >
                  Add
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {people.length > 0 && (
            <View>
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: FONT_SIZE.xs + 1,
                  fontWeight: FONT_WEIGHT.semibold,
                  marginBottom: SPACING.md - 2,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Current People
              </Text>
              {people.map((person, index) => (
                <View
                  key={person}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: colors.background.primary,
                    borderRadius: BORDER_RADIUS.md,
                    padding: SPACING.md + 2,
                    marginBottom: index === people.length - 1 ? 0 : SPACING.md - 2,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        width: AVATAR_SIZE.sm + 6,
                        height: AVATAR_SIZE.sm + 6,
                        backgroundColor: colors.accent.light,
                        borderRadius: BORDER_RADIUS.full,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: SPACING.md,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.accent.primary,
                          fontWeight: FONT_WEIGHT.bold,
                          fontSize: FONT_SIZE.base,
                        }}
                      >
                        {person.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontWeight: FONT_WEIGHT.semibold,
                        fontSize: FONT_SIZE.base,
                      }}
                    >
                      {person}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onRemovePerson(person)}
                    style={{
                      padding: SPACING.xs + 2,
                      borderRadius: BORDER_RADIUS.sm,
                    }}
                    activeOpacity={0.6}
                  >
                    <Ionicons
                      name="close-circle"
                      size={ICON_SIZE.lg}
                      color={colors.error}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};
