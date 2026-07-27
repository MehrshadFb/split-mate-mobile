import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AVATAR_SIZE, BORDER_RADIUS, CARD_STYLES, FONT_SIZE, FONT_WEIGHT, ICON_SIZE, SPACING } from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";
import { Item } from "../../../shared/types/invoice";
import { isCustomSplit } from "../../../shared/utils/splitCalculations";

interface ItemCardProps {
  item: Item;
  people: string[];
  onRename: (name: string) => void;
  onChangePrice: (price: number) => void;
  onDelete: () => void;
  onTogglePerson: (person: string) => void;
  onAdjustSplit: () => void;
}

type EditingField = "name" | "price" | null;

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  people,
  onRename,
  onChangePrice,
  onDelete,
  onTogglePerson,
  onAdjustSplit,
}) => {
  const { colors } = useTheme();
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [draft, setDraft] = useState("");
  const canAdjustSplit = item.splitBetween.length >= 2 && item.price > 0;
  const hasCustomSplit = isCustomSplit(item.splitBetween, item.shares);

  const beginEditName = () => {
    setDraft(item.name);
    setEditingField("name");
  };

  const beginEditPrice = () => {
    setDraft(item.price === 0 ? "" : item.price.toFixed(2));
    setEditingField("price");
  };

  const commitName = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== item.name) {
      onRename(trimmed);
    }
    setEditingField(null);
    setDraft("");
  };

  const commitPrice = () => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed) && parsed >= 0 && parsed !== item.price) {
      onChangePrice(parsed);
    }
    setEditingField(null);
    setDraft("");
  };

  const handlePriceDraft = (text: string) => {
    if (text === "" || /^\d*\.?\d{0,2}$/.test(text)) {
      setDraft(text);
    }
  };

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
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: SPACING.lg,
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
        <View style={{ flex: 1, justifyContent: "center" }}>
          {editingField === "name" ? (
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onBlur={commitName}
              onSubmitEditing={commitName}
              autoFocus
              selectTextOnFocus
              returnKeyType="done"
              placeholder="Item name"
              placeholderTextColor={colors.text.tertiary}
              style={{
                color: colors.text.primary,
                fontWeight: FONT_WEIGHT.bold,
                fontSize: FONT_SIZE.xl,
                paddingVertical: SPACING.xs,
                borderBottomWidth: 1.5,
                borderBottomColor: colors.accent.primary,
              }}
            />
          ) : (
            <TouchableOpacity
              onPress={beginEditName}
              activeOpacity={0.6}
              disabled={editingField !== null}
              hitSlop={{ top: 8, bottom: 8, left: 0, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={`Rename ${item.name}`}
              style={{ alignSelf: "flex-start" }}
            >
              <Text
                style={{
                  color: colors.text.primary,
                  fontWeight: FONT_WEIGHT.bold,
                  fontSize: FONT_SIZE.xl,
                }}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {editingField === "price" ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: SPACING.sm,
            }}
          >
            <Text
              style={{
                color: colors.accent.primary,
                fontWeight: FONT_WEIGHT.bold,
                fontSize: FONT_SIZE.xl + 2,
                marginRight: SPACING.xs,
              }}
            >
              $
            </Text>
            <TextInput
              value={draft}
              onChangeText={handlePriceDraft}
              onBlur={commitPrice}
              onSubmitEditing={commitPrice}
              autoFocus
              selectTextOnFocus
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.text.tertiary}
              style={{
                color: colors.accent.primary,
                fontWeight: FONT_WEIGHT.bold,
                fontSize: FONT_SIZE.xl + 2,
                paddingVertical: SPACING.xs,
                minWidth: 80,
                textAlign: "right",
                borderBottomWidth: 1.5,
                borderBottomColor: colors.accent.primary,
              }}
            />
          </View>
        ) : (
          <TouchableOpacity
            onPress={beginEditPrice}
            activeOpacity={0.6}
            disabled={editingField !== null}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 0 }}
            accessibilityRole="button"
            accessibilityLabel={`Edit price of ${item.name}`}
            style={{ marginLeft: SPACING.sm }}
          >
            <Text
              style={{
                color: colors.accent.primary,
                fontWeight: FONT_WEIGHT.bold,
                fontSize: FONT_SIZE.xl + 2,
              }}
            >
              ${item.price.toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
        {/* Trash hides while either field is being edited: a card in edit
            state shouldn't offer a way to destroy what's being typed. */}
        {editingField === null && (
          <>
            <View
              style={{
                width: 1,
                height: FONT_SIZE.xl,
                backgroundColor: colors.border,
                marginLeft: SPACING.md,
                marginRight: SPACING.md - SPACING.xs,
              }}
            />
            <TouchableOpacity
              onPress={handleDelete}
              hitSlop={{ top: 8, bottom: 8, left: 0, right: 8 }}
              activeOpacity={0.6}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${item.name}`}
              style={{
                padding: SPACING.xs,
                marginRight: -SPACING.xs,
              }}
            >
              <Ionicons
                name="trash-outline"
                size={ICON_SIZE.md}
                color={colors.text.tertiary}
              />
            </TouchableOpacity>
          </>
        )}
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
      {canAdjustSplit && (
        <View style={{ marginTop: SPACING.md, alignItems: "flex-start" }}>
          <TouchableOpacity
            onPress={onAdjustSplit}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderRadius: BORDER_RADIUS.full,
              backgroundColor: hasCustomSplit
                ? colors.accent.light
                : "transparent",
              borderWidth: 1,
              borderColor: hasCustomSplit
                ? colors.accent.primary
                : colors.border,
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="options-outline"
              size={ICON_SIZE.sm}
              color={
                hasCustomSplit
                  ? colors.accent.primary
                  : colors.text.secondary
              }
              style={{ marginRight: SPACING.xs + 2 }}
            />
            <Text
              style={{
                color: hasCustomSplit
                  ? colors.accent.primary
                  : colors.text.secondary,
                fontWeight: FONT_WEIGHT.semibold,
                fontSize: FONT_SIZE.sm,
              }}
            >
              {hasCustomSplit ? "Custom split" : "Adjust portions"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
