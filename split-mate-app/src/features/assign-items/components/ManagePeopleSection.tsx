// src/features/assign-items/components/ManagePeopleSection.tsx
// Collapsible section for managing people

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
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
        borderRadius: 16,
        marginBottom: 20,
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
          padding: 18,
          backgroundColor: colors.background.secondary,
        }}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 40,
              height: 40,
              backgroundColor: colors.accent.light,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="people" size={22} color={colors.accent.primary} />
          </View>
          <View>
            <Text
              style={{
                color: colors.text.primary,
                fontWeight: "700",
                fontSize: 17,
              }}
            >
              Manage People
            </Text>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: 13,
                marginTop: 2,
              }}
            >
              {people.length} {people.length === 1 ? "person" : "people"}
            </Text>
          </View>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color={colors.text.tertiary}
        />
      </TouchableOpacity>
      {isExpanded && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            padding: 18,
          }}
        >
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: 13,
                fontWeight: "600",
                marginBottom: 10,
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
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  color: colors.text.primary,
                  fontSize: 16,
                  marginRight: 10,
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
                  borderRadius: 12,
                  paddingHorizontal: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 70,
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    color: colors.text.inverse,
                    fontWeight: "700",
                    fontSize: 15,
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
                  fontSize: 13,
                  fontWeight: "600",
                  marginBottom: 10,
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
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: index === people.length - 1 ? 0 : 10,
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
                        width: 38,
                        height: 38,
                        backgroundColor: colors.accent.light,
                        borderRadius: 19,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.accent.primary,
                          fontWeight: "700",
                          fontSize: 16,
                        }}
                      >
                        {person.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontWeight: "600",
                        fontSize: 16,
                      }}
                    >
                      {person}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onRemovePerson(person)}
                    style={{
                      padding: 6,
                      borderRadius: 8,
                    }}
                    activeOpacity={0.6}
                  >
                    <Ionicons
                      name="close-circle"
                      size={24}
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
