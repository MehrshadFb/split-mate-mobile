import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AVATAR_SIZE, BORDER_RADIUS, CARD_STYLES, FONT_SIZE, FONT_WEIGHT, ICON_SIZE, SPACING } from "../../../shared/constants/design";
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
        borderRadius: CARD_STYLES.borderRadius,
        padding: CARD_STYLES.padding,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: colors.border,
        ...CARD_STYLES.shadow,
      }}
    >
      {isEditing ? (
        <View>
          <Text
            style={{
              color: colors.text.secondary,
              fontWeight: FONT_WEIGHT.semibold,
              marginBottom: SPACING.xs + 2,
            }}
          >
            Item name
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.background.primary,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: BORDER_RADIUS.md,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.md - 2,
              color: colors.text.primary,
              marginBottom: SPACING.lg,
            }}
            value={editName}
            onChangeText={onChangeName}
            placeholder="Item name"
            placeholderTextColor={colors.text.tertiary}
          />
          <Text
            style={{
              color: colors.text.secondary,
              fontWeight: FONT_WEIGHT.semibold,
              marginBottom: SPACING.xs + 2,
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
              borderRadius: BORDER_RADIUS.md,
              paddingHorizontal: SPACING.md,
              paddingVertical: 2,
            }}
          >
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: FONT_SIZE.base,
                marginRight: SPACING.xs,
              }}
            >
              $
            </Text>
            <TextInput
              style={{
                flex: 1,
                color: colors.text.primary,
                paddingVertical: SPACING.sm,
              }}
              value={editPrice}
              onChangeText={onChangePrice}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.text.tertiary}
            />
          </View>
          <View style={{ flexDirection: "row", marginTop: SPACING.xl }}>
            <TouchableOpacity
              onPress={onSaveEdit}
              style={{
                flex: 1,
                backgroundColor: colors.accent.primary,
                paddingVertical: SPACING.md,
                borderRadius: BORDER_RADIUS.md,
                marginRight: SPACING.md,
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  color: colors.text.inverse,
                  textAlign: "center",
                  fontWeight: FONT_WEIGHT.bold,
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
                paddingVertical: SPACING.md,
                borderRadius: BORDER_RADIUS.md,
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  color: colors.text.primary,
                  textAlign: "center",
                  fontWeight: FONT_WEIGHT.bold,
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
              marginBottom: SPACING.lg + 2,
            }}
          >
            <View
              style={{
                width: AVATAR_SIZE.lg,
                height: AVATAR_SIZE.lg,
                borderRadius: BORDER_RADIUS.md,
                backgroundColor: colors.accent.light,
                alignItems: "center",
                justifyContent: "center",
                marginRight: SPACING.md,
              }}
            >
              <Ionicons
                name="fast-food-outline"
                size={ICON_SIZE.md + 2}
                color={colors.accent.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.text.primary,
                  fontWeight: FONT_WEIGHT.bold,
                  fontSize: FONT_SIZE.xl,
                }}
              >
                {item.name}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  color: colors.accent.primary,
                  fontWeight: FONT_WEIGHT.bold,
                  fontSize: FONT_SIZE.xl + 2,
                }}
              >
                ${item.price.toFixed(2)}
              </Text>
              <View style={{ flexDirection: "row", marginTop: SPACING.md - 2 }}>
                <TouchableOpacity
                  onPress={onStartEdit}
                  style={{
                    padding: SPACING.sm,
                    borderRadius: BORDER_RADIUS.sm,
                    backgroundColor: colors.background.primary,
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginRight: SPACING.sm,
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="pencil"
                    size={ICON_SIZE.lg - 6}
                    color={colors.accent.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  style={{
                    padding: SPACING.sm,
                    borderRadius: BORDER_RADIUS.sm,
                    backgroundColor: colors.background.primary,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="trash"
                    size={ICON_SIZE.lg - 6}
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
              marginBottom: SPACING.md,
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
                    paddingHorizontal: SPACING.md + 2,
                    paddingVertical: SPACING.md - 2,
                    borderRadius: BORDER_RADIUS.xl + 4,
                    marginRight: SPACING.sm,
                    marginBottom: SPACING.sm,
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
                    size={ICON_SIZE.sm}
                    color={
                      isSelected
                        ? colors.text.inverse
                        : colors.text.secondary
                    }
                    style={{ marginRight: SPACING.xs + 2 }}
                  />
                  <Text
                    style={{
                      fontWeight: FONT_WEIGHT.semibold,
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
