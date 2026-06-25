import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Slider } from "../../../shared/components/Slider";
import {
  BORDER_RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  ICON_SIZE,
  SPACING,
} from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";
import {
  computeSplitAmounts,
  dollarsToShares,
  initialAmountsForModal,
  rebalanceAfterChange,
} from "../../../shared/utils/splitCalculations";

interface CustomSplitModalProps {
  visible: boolean;
  itemName: string;
  price: number;
  splitBetween: string[];
  shares?: Record<string, number>;
  onClose: () => void;
  onSave: (shares: Record<string, number> | undefined) => void;
}

export const CustomSplitModal: React.FC<CustomSplitModalProps> = ({
  visible,
  itemName,
  price,
  splitBetween,
  shares,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [locked, setLocked] = useState<Set<string>>(new Set());
  const [editingPerson, setEditingPerson] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (visible) {
      setAmounts(initialAmountsForModal(price, splitBetween, shares));
      setLocked(new Set());
      setEditingPerson(null);
      setEditText("");
    }
  }, [visible, price, splitBetween, shares]);

  const adjustable = price > 0 && splitBetween.length >= 2;

  const displayedAmounts = useMemo(() => {
    const result: Record<string, number> = {};
    if (splitBetween.length === 0) return result;
    const arr = computeSplitAmounts(price, splitBetween, amounts);
    splitBetween.forEach((p, i) => {
      result[p] = arr[i];
    });
    return result;
  }, [amounts, price, splitBetween]);

  const lockedSum = useMemo(() => {
    let sum = 0;
    splitBetween.forEach((p) => {
      if (locked.has(p)) sum += displayedAmounts[p] ?? 0;
    });
    return sum;
  }, [displayedAmounts, locked, splitBetween]);

  const sliderMaxFor = (person: string) => {
    if (locked.has(person)) {
      return Math.max(price, 0.01);
    }
    return Math.max(price - lockedSum, 0.01);
  };

  const handleSlide = (person: string, value: number) => {
    if (!adjustable) return;
    setAmounts((prev) =>
      rebalanceAfterChange(prev, person, value, price, splitBetween, locked)
    );
  };

  const hasOtherUnlocked = (person: string) =>
    splitBetween.some((p) => p !== person && !locked.has(p));

  const beginEdit = (person: string) => {
    if (!adjustable || locked.has(person) || !hasOtherUnlocked(person)) return;
    setEditingPerson(person);
    setEditText((displayedAmounts[person] ?? 0).toFixed(2));
  };

  const commitEdit = (person: string, text: string) => {
    const cleaned = text.trim().replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);
    const next = isNaN(parsed) ? amounts[person] ?? 0 : parsed;
    const updated = rebalanceAfterChange(
      amounts,
      person,
      next,
      price,
      splitBetween,
      locked
    );
    setAmounts(updated);
    setEditingPerson(null);
    setEditText("");
    return updated;
  };

  const handleToggleLock = (person: string) => {
    Haptics.selectionAsync();
    setLocked((prev) => {
      const next = new Set(prev);
      if (next.has(person)) {
        next.delete(person);
      } else {
        next.add(person);
      }
      return next;
    });
    if (editingPerson === person) {
      setEditingPerson(null);
      setEditText("");
    }
  };

  const handleResetToEqual = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAmounts(initialAmountsForModal(price, splitBetween, undefined));
    setLocked(new Set());
    setEditingPerson(null);
    setEditText("");
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const finalAmounts =
      editingPerson !== null
        ? commitEdit(editingPerson, editText)
        : amounts;
    const nextShares = dollarsToShares(finalAmounts, splitBetween);
    onSave(nextShares);
  };

  const handleClose = () => {
    setEditingPerson(null);
    setEditText("");
    onClose();
  };

  const displayedTotal = useMemo(
    () => splitBetween.reduce((sum, p) => sum + (displayedAmounts[p] ?? 0), 0),
    [displayedAmounts, splitBetween]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable
          onPress={handleClose}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.background.primary,
              borderTopLeftRadius: BORDER_RADIUS.xl,
              borderTopRightRadius: BORDER_RADIUS.xl,
              maxHeight: "90%",
            }}
          >
            <SafeAreaView edges={["bottom"]}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: SPACING.xl,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: FONT_SIZE.xl,
                      fontWeight: FONT_WEIGHT.bold,
                      color: colors.text.primary,
                    }}
                  >
                    Adjust Split
                  </Text>
                  <Text
                    style={{
                      fontSize: FONT_SIZE.sm,
                      color: colors.text.secondary,
                      marginTop: SPACING.xs,
                    }}
                    numberOfLines={1}
                  >
                    {itemName}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  hitSlop={10}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: BORDER_RADIUS.full,
                    backgroundColor: colors.background.secondary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="close"
                    size={ICON_SIZE.md}
                    color={colors.text.primary}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ maxHeight: 520 }}
                contentContainerStyle={{ padding: SPACING.xl }}
                keyboardShouldPersistTaps="handled"
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: colors.accent.light,
                    paddingHorizontal: SPACING.lg,
                    paddingVertical: SPACING.md,
                    borderRadius: BORDER_RADIUS.md,
                    marginBottom: SPACING.lg,
                  }}
                >
                  <Text
                    style={{
                      fontSize: FONT_SIZE.sm,
                      fontWeight: FONT_WEIGHT.semibold,
                      color: colors.accent.primary,
                      textTransform: "uppercase",
                    }}
                  >
                    Item Total
                  </Text>
                  <Text
                    style={{
                      fontSize: FONT_SIZE.xl,
                      fontWeight: FONT_WEIGHT.bold,
                      color: colors.accent.primary,
                    }}
                  >
                    ${price.toFixed(2)}
                  </Text>
                </View>

                {!adjustable && (
                  <View
                    style={{
                      backgroundColor: colors.background.secondary,
                      borderRadius: BORDER_RADIUS.md,
                      padding: SPACING.lg,
                      marginBottom: SPACING.lg,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.text.secondary,
                        fontSize: FONT_SIZE.sm,
                        textAlign: "center",
                      }}
                    >
                      {price <= 0
                        ? "Set a price on this item before adjusting the split."
                        : "Assign at least two people to adjust the split."}
                    </Text>
                  </View>
                )}

                <View
                  style={{
                    backgroundColor: colors.background.secondary,
                    borderRadius: BORDER_RADIUS.lg,
                    borderWidth: 1,
                    borderColor: colors.border,
                    overflow: "hidden",
                  }}
                >
                  {splitBetween.map((person, index) => {
                    const value = amounts[person] ?? 0;
                    const displayedValue = displayedAmounts[person] ?? 0;
                    const isEditing = editingPerson === person;
                    const isLocked = locked.has(person);
                    const isFixedByLocks =
                      !isLocked && !hasOtherUnlocked(person);
                    const isInteractive = adjustable && !isLocked && !isFixedByLocks;
                    return (
                      <View
                        key={person}
                        style={{
                          paddingHorizontal: SPACING.lg,
                          paddingVertical: SPACING.lg,
                          borderTopWidth: index === 0 ? 0 : 1,
                          borderTopColor: colors.border,
                          backgroundColor:
                            isLocked || isFixedByLocks
                              ? colors.accent.light
                              : "transparent",
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: SPACING.sm,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => handleToggleLock(person)}
                            disabled={!adjustable}
                            hitSlop={8}
                            accessibilityRole="switch"
                            accessibilityState={{ checked: isLocked }}
                            accessibilityLabel={`${person} ${
                              isLocked ? "locked" : "unlocked"
                            }`}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: BORDER_RADIUS.full,
                              backgroundColor: isLocked
                                ? colors.accent.primary
                                : "transparent",
                              borderWidth: 1,
                              borderColor: isLocked
                                ? colors.accent.primary
                                : colors.border,
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: SPACING.md,
                              opacity: !adjustable ? 0.5 : 1,
                            }}
                          >
                            <Ionicons
                              name={
                                isLocked ? "lock-closed" : "lock-open-outline"
                              }
                              size={ICON_SIZE.sm}
                              color={
                                isLocked
                                  ? colors.text.inverse
                                  : colors.text.tertiary
                              }
                            />
                          </TouchableOpacity>
                          <Text
                            style={{
                              flex: 1,
                              color: colors.text.primary,
                              fontWeight: FONT_WEIGHT.semibold,
                              fontSize: FONT_SIZE.base,
                            }}
                            numberOfLines={1}
                          >
                            {person}
                          </Text>
                          {isEditing ? (
                            <TextInput
                              value={editText}
                              onChangeText={setEditText}
                              onBlur={() => commitEdit(person, editText)}
                              onSubmitEditing={() =>
                                commitEdit(person, editText)
                              }
                              keyboardType="decimal-pad"
                              autoFocus
                              selectTextOnFocus
                              style={{
                                minWidth: 96,
                                paddingHorizontal: SPACING.sm,
                                paddingVertical: SPACING.xs,
                                borderRadius: BORDER_RADIUS.sm,
                                borderWidth: 1,
                                borderColor: colors.accent.primary,
                                color: colors.accent.primary,
                                fontSize: FONT_SIZE.lg,
                                fontWeight: FONT_WEIGHT.bold,
                                textAlign: "right",
                                backgroundColor: colors.background.primary,
                              }}
                            />
                          ) : (
                            <TouchableOpacity
                              onPress={() => beginEdit(person)}
                              disabled={!isInteractive}
                              hitSlop={8}
                            >
                              <Text
                                style={{
                                  color: colors.accent.primary,
                                  fontWeight: FONT_WEIGHT.bold,
                                  fontSize: FONT_SIZE.lg,
                                }}
                              >
                                ${displayedValue.toFixed(2)}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        <Slider
                          minimumValue={0}
                          maximumValue={sliderMaxFor(person)}
                          value={value}
                          onValueChange={(v) => handleSlide(person, v)}
                          onSlidingStart={() => Haptics.selectionAsync()}
                          onSlidingComplete={() =>
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light
                            )
                          }
                          disabled={!isInteractive}
                          minimumTrackTintColor={colors.accent.primary}
                          maximumTrackTintColor={colors.border}
                          thumbTintColor={colors.accent.primary}
                        />
                      </View>
                    );
                  })}
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: SPACING.lg,
                    paddingHorizontal: SPACING.xs,
                  }}
                >
                  <Text
                    style={{
                      fontSize: FONT_SIZE.sm,
                      color: colors.text.secondary,
                    }}
                  >
                    Sum
                  </Text>
                  <Text
                    style={{
                      fontSize: FONT_SIZE.sm,
                      fontWeight: FONT_WEIGHT.semibold,
                      color:
                        Math.abs(displayedTotal - price) < 0.005
                          ? colors.text.secondary
                          : colors.error,
                    }}
                  >
                    ${displayedTotal.toFixed(2)} / ${price.toFixed(2)}
                  </Text>
                </View>
              </ScrollView>

              <View
                style={{
                  flexDirection: "row",
                  padding: SPACING.xl,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  gap: SPACING.md,
                }}
              >
                <TouchableOpacity
                  onPress={handleResetToEqual}
                  disabled={!adjustable}
                  style={{
                    flex: 1,
                    paddingVertical: SPACING.md,
                    borderRadius: BORDER_RADIUS.md,
                    borderWidth: 1,
                    borderColor: colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: !adjustable ? 0.5 : 1,
                  }}
                >
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontWeight: FONT_WEIGHT.semibold,
                      fontSize: FONT_SIZE.base,
                    }}
                  >
                    Reset to Equal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  style={{
                    flex: 1,
                    paddingVertical: SPACING.md,
                    borderRadius: BORDER_RADIUS.md,
                    backgroundColor: colors.accent.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: colors.text.inverse,
                      fontWeight: FONT_WEIGHT.bold,
                      fontSize: FONT_SIZE.base,
                    }}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};
