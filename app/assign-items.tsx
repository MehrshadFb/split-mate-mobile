// app/assign-items.tsx
// Items assignment screen - assign items to people (NOT a tab)

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../src/components/Button";
import { useTheme } from "../src/contexts/ThemeContext";
import { useInvoiceStore } from "../src/stores/invoiceStore";
import { Item } from "../src/types/invoice";

export default function AssignItemsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const {
    currentInvoice,
    people,
    addItem,
    updateItem,
    deleteItem,
    togglePersonForItem,
    saveCurrentInvoice,
    resetSession,
    clearInvoice,
    editingSavedInvoice,
    hasUnsavedChanges,
    setEditingSavedInvoice,
    loadSavedInvoices,
    setPeople,
    deleteSavedInvoice,
  } = useInvoiceStore();

  const allowNavigationRef = useRef(false);

  const clearExistingSession = useCallback(() => {
    setEditingSavedInvoice(false);
    clearInvoice();
    setPeople([]);
  }, [setEditingSavedInvoice, clearInvoice, setPeople]);

  const resetNewSession = useCallback(() => {
    resetSession();
  }, [resetSession]);

  const [editingItem, setEditingItem] = useState<{
    index: number;
    name: string;
    price: number;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const navigateToList = useCallback(
    (resetType: "new" | "existing") => {
      loadSavedInvoices();

      if (resetType === "existing") {
        clearExistingSession();
      } else {
        resetNewSession();
      }

      allowNavigationRef.current = true;
      router.replace("/(tabs)/receipts");
    },
    [loadSavedInvoices, clearExistingSession, resetNewSession, router]
  );

  const handleSaveInvoice = useCallback(async () => {
    if (!currentInvoice || currentInvoice.items.length === 0) {
      Alert.alert("Nothing to save", "Add items before saving this receipt.");
      return false;
    }

    try {
      setIsSaving(true);
      const savedInvoice = await saveCurrentInvoice();

      if (savedInvoice) {
        navigateToList(editingSavedInvoice ? "existing" : "new");
        return true;
      }
    } catch (error) {
      Alert.alert(
        "Save failed",
        "We couldn't store this receipt. Please try again."
      );
    } finally {
      setIsSaving(false);
    }

    return false;
  }, [currentInvoice, saveCurrentInvoice, navigateToList, editingSavedInvoice]);

  useEffect(() => {
    if (!editingSavedInvoice) {
      return;
    }

    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      if (allowNavigationRef.current) {
        allowNavigationRef.current = false;
        return;
      }

      if (!hasUnsavedChanges) {
        clearExistingSession();
        allowNavigationRef.current = true;
        navigation.dispatch(event.data.action);
        return;
      }

      event.preventDefault();

      Alert.alert(
        "Unsaved changes",
        "Do you want to save your changes before leaving?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              clearExistingSession();
              allowNavigationRef.current = true;
              navigation.dispatch(event.data.action);
            },
          },
          {
            text: "Save changes",
            onPress: () => {
              handleSaveInvoice();
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [
    navigation,
    editingSavedInvoice,
    hasUnsavedChanges,
    clearExistingSession,
    handleSaveInvoice,
  ]);

  if (!currentInvoice) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background.primary }}
      >
        <View className="p-6">
          <TouchableOpacity
            onPress={() => {
              clearExistingSession();
              router.replace("/(tabs)/mates");
            }}
            className="flex-row items-center mb-6"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            <Text
              style={{
                color: colors.text.primary,
                fontSize: 18,
                marginLeft: 8,
              }}
            >
              Back
            </Text>
          </TouchableOpacity>

          <View className="flex-1 items-center justify-center">
            <Ionicons
              name="receipt-outline"
              size={64}
              color={colors.text.tertiary}
            />
            <Text
              style={{
                color: colors.text.primary,
                fontSize: 20,
                fontWeight: "600",
                marginTop: 16,
                textAlign: "center",
              }}
            >
              No Invoice Found
            </Text>
            <Text
              style={{
                color: colors.text.secondary,
                textAlign: "center",
                marginTop: 8,
                marginBottom: 24,
              }}
            >
              Go back and upload receipts to get started
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const handleSaveEdit = () => {
    if (editingItem) {
      updateItem(editingItem.index, {
        name: editingItem.name,
        price: editingItem.price,
      });
      setEditingItem(null);
    }
  };

  const handleAddItem = () => {
    const newItem: Item = {
      name: "New Item",
      price: 0,
      splitBetween: [],
    };
    addItem(newItem);
  };

  const calculateTotalAmount = () => {
    return currentInvoice.items.reduce((sum, item) => sum + item.price, 0);
  };

  const handleBack = () => {
    if (editingSavedInvoice) {
      if (hasUnsavedChanges) {
        Alert.alert(
          "Unsaved changes",
          "Do you want to save your changes before leaving?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Discard",
              style: "destructive",
              onPress: () => navigateToList("existing"),
            },
            {
              text: "Save changes",
              onPress: () => {
                handleSaveInvoice();
              },
            },
          ]
        );
      } else {
        navigateToList("existing");
      }
    } else {
      router.push("/(tabs)/upload");
    }
  };

  const handleDeleteReceipt = () => {
    if (!currentInvoice?.id) return;

    Alert.alert(
      "Delete Receipt",
      "Are you sure you want to delete this receipt? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSavedInvoice(currentInvoice.id);
              navigateToList("existing");
            } catch (error) {
              Alert.alert(
                "Delete Failed",
                "We couldn't delete this receipt. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const saveButtonLabel = editingSavedInvoice
    ? "Update Receipt"
    : "Save Receipt";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
    >
      <ScrollView className="flex-1">
        <View className="p-6">
          {/* Header with Back Button and Delete Icon */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <TouchableOpacity
              onPress={handleBack}
              className="flex-row items-center"
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.text.primary}
              />
            </TouchableOpacity>

            {editingSavedInvoice && currentInvoice?.id && (
              <TouchableOpacity
                onPress={handleDeleteReceipt}
                style={{
                  padding: 8,
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={28} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>

          {/* Title */}
          <View className="mb-6">
            <Text
              style={{
                fontSize: 36,
                fontWeight: "bold",
                color: colors.text.primary,
                marginBottom: 8,
              }}
            >
              Assign Items
            </Text>
            <Text style={{ fontSize: 18, color: colors.text.secondary }}>
              Select who ordered each item
            </Text>
          </View>

          {/* Items List */}
          <View className="mb-6">
            {currentInvoice.items.length === 0 ? (
              <View
                style={{
                  backgroundColor: colors.background.secondary,
                  borderRadius: 12,
                  padding: 32,
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Ionicons
                  name="receipt-outline"
                  size={48}
                  color={colors.text.tertiary}
                />
                <Text
                  style={{
                    color: colors.text.primary,
                    fontSize: 18,
                    fontWeight: "600",
                    marginTop: 12,
                    textAlign: "center",
                  }}
                >
                  No Items Yet
                </Text>
                <Text
                  style={{
                    color: colors.text.secondary,
                    textAlign: "center",
                    marginTop: 8,
                  }}
                >
                  Add items manually using the button below
                </Text>
              </View>
            ) : (
              currentInvoice.items.map((item, index) => {
                return (
                  <View
                    key={index}
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
                    {editingItem?.index === index ? (
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
                          value={editingItem.name}
                          onChangeText={(text) =>
                            setEditingItem({ ...editingItem, name: text })
                          }
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
                            value={editingItem.price.toString()}
                            onChangeText={(text) =>
                              setEditingItem({
                                ...editingItem,
                                price: parseFloat(text) || 0,
                              })
                            }
                            keyboardType="decimal-pad"
                            placeholder="0.00"
                            placeholderTextColor={colors.text.tertiary}
                          />
                        </View>

                        <View
                          style={{
                            flexDirection: "row",
                            marginTop: 20,
                          }}
                        >
                          <TouchableOpacity
                            onPress={handleSaveEdit}
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
                              Save changes
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => setEditingItem(null)}
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
                            <View
                              style={{ flexDirection: "row", marginTop: 10 }}
                            >
                              <TouchableOpacity
                                onPress={() =>
                                  setEditingItem({
                                    index,
                                    name: item.name,
                                    price: item.price,
                                  })
                                }
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
                                onPress={() => {
                                  Alert.alert(
                                    "Delete Item",
                                    "Are you sure you want to delete this item?",
                                    [
                                      { text: "Cancel", style: "cancel" },
                                      {
                                        text: "Delete",
                                        style: "destructive",
                                        onPress: () => deleteItem(index),
                                      },
                                    ]
                                  );
                                }}
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

                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                          }}
                        >
                          {people.map((person) => {
                            const isSelected =
                              item.splitBetween.includes(person);
                            return (
                              <TouchableOpacity
                                key={person}
                                onPress={() =>
                                  togglePersonForItem(index, person)
                                }
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
                                    isSelected
                                      ? "checkmark-circle"
                                      : "person-add-outline"
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
              })
            )}
          </View>

          {/* Add Item Button */}
          <Button
            title="Add New Item"
            onPress={handleAddItem}
            variant="outline"
            size="medium"
            fullWidth
            icon={
              <Ionicons name="add-circle-outline" size={20} color="#D97757" />
            }
          />

          {/* Split Summary */}
          {currentInvoice.totals && currentInvoice.totals.length > 0 && (
            <View style={{ marginTop: 32 }}>
              <View
                style={{
                  backgroundColor: colors.background.secondary,
                  borderRadius: 20,
                  padding: 24,
                  borderWidth: 1,
                  borderColor: colors.border,
                  shadowColor: "#000000",
                  shadowOpacity: 0.06,
                  shadowRadius: 14,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 3,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      backgroundColor: colors.accent.light,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons
                      name="pie-chart-outline"
                      size={24}
                      color={colors.accent.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontWeight: "700",
                        fontSize: 24,
                      }}
                    >
                      Split Summary
                    </Text>
                    <Text
                      style={{
                        color: colors.text.secondary,
                        marginTop: 4,
                      }}
                    >
                      Review the breakdown before you save this receipt.
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: colors.accent.primary,
                    borderRadius: 18,
                    padding: 20,
                    marginBottom: 20,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text
                      style={{
                        color: colors.text.inverse,
                        opacity: 0.8,
                        fontSize: 14,
                        fontWeight: "600",
                        textTransform: "uppercase",
                      }}
                    >
                      Receipt Total
                    </Text>
                    <Text
                      style={{
                        color: colors.text.inverse,
                        fontWeight: "800",
                        fontSize: 32,
                        marginTop: 4,
                      }}
                    >
                      ${calculateTotalAmount().toFixed(2)}
                    </Text>
                  </View>
                  <Ionicons
                    name="wallet-outline"
                    size={32}
                    color={colors.text.inverse}
                  />
                </View>

                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      color: colors.text.secondary,
                      fontSize: 14,
                      fontWeight: "600",
                      marginBottom: 12,
                      textTransform: "uppercase",
                    }}
                  >
                    How much each person owes
                  </Text>
                  {currentInvoice.totals.map((person) => {
                    return (
                      <View
                        key={person.name}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: colors.background.primary,
                          borderRadius: 16,
                          padding: 16,
                          marginBottom: 12,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            backgroundColor: colors.accent.light,
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                          }}
                        >
                          <Text
                            style={{
                              color: colors.accent.primary,
                              fontWeight: "700",
                              fontSize: 18,
                            }}
                          >
                            {person.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              color: colors.text.primary,
                              fontWeight: "700",
                              fontSize: 16,
                            }}
                          >
                            {person.name}
                          </Text>
                        </View>
                        <Text
                          style={{
                            color: colors.accent.primary,
                            fontWeight: "700",
                            fontSize: 18,
                          }}
                        >
                          ${person.total.toFixed(2)}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <Button
                  title={saveButtonLabel}
                  onPress={handleSaveInvoice}
                  variant="primary"
                  size="large"
                  fullWidth
                  loading={isSaving}
                  disabled={currentInvoice.items.length === 0}
                  icon={
                    <Ionicons
                      name="download-outline"
                      size={20}
                      color={colors.text.inverse}
                    />
                  }
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
