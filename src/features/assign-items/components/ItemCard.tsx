// src/features/assign-items/components/ItemCard.tsx
// Card component for displaying and editing an item

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../shared/contexts/ThemeContext";
import { Item } from "../../../shared/types/invoice";

interface ItemCardProps {
  item: Item;
  index: number;
  people: string[];
  isEditing: boolean;
  editName: string;
  editPrice: string;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onChangeName: (text: string) => void;
  onChangePrice: (text: string) => void;
  onDelete: () => void;
  onTogglePerson: (person: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  index,
  people,
  isEditing,
  editName,
  editPrice,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onChangeName,
  onChangePrice,
  onDelete,
  onTogglePerson,
}) => {
  const { colors } = useTheme();

  const handleDelete = () => {
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <View
      style={{
        backgroundColor: colors.background.secondary,
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: "#000000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      {isEditing ? (
        <View>
          <Text
            style={{
              color: colors.text.secondary,
              fontWeight: "600",
              marginBottom: 6,
            }}
          >
            Item name
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.background.primary,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: colors.text.primary,
              marginBottom: 16,
            }}
            value={editName}
            onChangeText={onChangeName}
            placeholder="Item name"
            placeholderTextColor={colors.text.tertiary}
          />

          <Text
            style={{
              color: colors.text.secondary,
              fontWeight: "600",
              marginBottom: 6,
            }}
          >
            Item price
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.background.primary,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 2,
            }}
          >
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: 16,
                marginRight: 4,
              }}
            >
              $
            </Text>
            <TextInput
              style={{
                flex: 1,
                color: colors.text.primary,
                paddingVertical: 8,
              }}
              value={editPrice}
              onChangeText={onChangePrice}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.text.tertiary}
            />
          </View>

          <View style={{ flexDirection: "row", marginTop: 20 }}>
            <TouchableOpacity
              onPress={onSaveEdit}
              style={{
                flex: 1,
                backgroundColor: colors.accent.primary,
                paddingVertical: 12,
                borderRadius: 10,
                marginRight: 12,
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  color: colors.text.inverse,
                  textAlign: "center",
                  fontWeight: "700",
                }}
              >
                Save
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onCancelEdit}
              style={{
                flex: 1,
                backgroundColor: colors.neutral[300],
                paddingVertical: 12,
                borderRadius: 10,
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  color: colors.text.primary,
                  textAlign: "center",
                  fontWeight: "700",
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: colors.accent.light,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Ionicons
                name="fast-food-outline"
                size={22}
                color={colors.accent.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.text.primary,
                  fontWeight: "700",
                  fontSize: 20,
                }}
              >
                {item.name}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  color: colors.accent.primary,
                  fontWeight: "700",
                  fontSize: 22,
                }}
              >
                ${item.price.toFixed(2)}
              </Text>
              <View style={{ flexDirection: "row", marginTop: 10 }}>
                <TouchableOpacity
                  onPress={onStartEdit}
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    backgroundColor: colors.background.primary,
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginRight: 8,
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="pencil"
                    size={18}
                    color={colors.accent.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    backgroundColor: colors.background.primary,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="trash"
                    size={18}
                    color={colors.accent.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              marginBottom: 12,
            }}
          />

          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {people.map((person) => {
              const isSelected = item.splitBetween.includes(person);
              return (
                <TouchableOpacity
                  key={person}
                  onPress={() => onTogglePerson(person)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 24,
                    marginRight: 8,
                    marginBottom: 8,
                    backgroundColor: isSelected
                      ? colors.accent.primary
                      : colors.background.primary,
                    borderWidth: 1,
                    borderColor: isSelected
                      ? colors.accent.primary
                      : colors.border,
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      isSelected ? "checkmark-circle" : "person-add-outline"
                    }
                    size={16}
                    color={
                      isSelected
                        ? colors.text.inverse
                        : colors.text.secondary
                    }
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      fontWeight: "600",
                      color: isSelected
                        ? colors.text.inverse
                        : colors.text.primary,
                    }}
                  >
                    {person}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
};
