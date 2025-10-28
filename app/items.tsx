// app/items.tsx
// Items assignment screen - assign items to people (NOT a tab)

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

export default function ItemsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    currentInvoice,
    people,
    addItem,
    updateItem,
    deleteItem,
    togglePersonForItem,
  } = useInvoiceStore();

  const [editingItem, setEditingItem] = useState<{
    index: number;
    name: string;
    price: number;
  } | null>(null);

  if (!currentInvoice) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background.primary }}
      >
        <View className="p-6">
          {/* Header with Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-6"
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

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
    >
      <ScrollView className="flex-1">
        <View className="p-6">
          {/* Header with Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-6"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            <Text
              style={{
                color: colors.text.primary,
                fontSize: 18,
                marginLeft: 8,
                fontWeight: "600",
              }}
            >
              Back to Upload
            </Text>
          </TouchableOpacity>

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
              currentInvoice.items.map((item, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: colors.background.secondary,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  {/* Item Header */}
                  {editingItem?.index === index ? (
                    <View className="mb-3">
                      <TextInput
                        style={{
                          backgroundColor: colors.background.primary,
                          borderWidth: 1,
                          borderColor: colors.border,
                          borderRadius: 8,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          color: colors.text.primary,
                          marginBottom: 8,
                        }}
                        value={editingItem.name}
                        onChangeText={(text) =>
                          setEditingItem({ ...editingItem, name: text })
                        }
                        placeholder="Item name"
                        placeholderTextColor={colors.text.tertiary}
                      />
                      <View className="flex-row items-center">
                        <Text
                          style={{ color: colors.text.primary, marginRight: 8 }}
                        >
                          $
                        </Text>
                        <TextInput
                          style={{
                            flex: 1,
                            backgroundColor: colors.background.primary,
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            color: colors.text.primary,
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
                      <View className="flex-row mt-2">
                        <TouchableOpacity
                          onPress={handleSaveEdit}
                          style={{
                            flex: 1,
                            backgroundColor: colors.accent.primary,
                            paddingVertical: 8,
                            borderRadius: 8,
                            marginRight: 8,
                          }}
                        >
                          <Text
                            style={{
                              color: colors.text.inverse,
                              textAlign: "center",
                              fontWeight: "600",
                            }}
                          >
                            Save
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setEditingItem(null)}
                          style={{
                            flex: 1,
                            backgroundColor: colors.neutral[300],
                            paddingVertical: 8,
                            borderRadius: 8,
                          }}
                        >
                          <Text
                            style={{
                              color: colors.text.primary,
                              textAlign: "center",
                              fontWeight: "600",
                            }}
                          >
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <View className="flex-1">
                        <Text
                          style={{
                            color: colors.text.primary,
                            fontWeight: "600",
                            fontSize: 16,
                          }}
                        >
                          {item.name}
                        </Text>
                        <Text
                          style={{
                            color: colors.accent.primary,
                            fontWeight: "bold",
                            fontSize: 18,
                          }}
                        >
                          ${item.price.toFixed(2)}
                        </Text>
                      </View>
                      <View className="flex-row">
                        <TouchableOpacity
                          onPress={() =>
                            setEditingItem({
                              index,
                              name: item.name,
                              price: item.price,
                            })
                          }
                          className="p-2 mr-1"
                        >
                          <Ionicons
                            name="pencil"
                            size={20}
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
                          className="p-2"
                        >
                          <Ionicons
                            name="trash"
                            size={20}
                            color={colors.accent.primary}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* People Pills */}
                  <View className="flex-row flex-wrap">
                    {people.map((person) => {
                      const isSelected = item.splitBetween.includes(person);
                      return (
                        <TouchableOpacity
                          key={person}
                          onPress={() => togglePersonForItem(index, person)}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 20,
                            marginRight: 8,
                            marginBottom: 8,
                            backgroundColor: isSelected
                              ? colors.accent.primary
                              : colors.neutral[200],
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={{
                              fontWeight: "500",
                              color: isSelected
                                ? colors.text.inverse
                                : colors.text.secondary,
                            }}
                          >
                            {person}{" "}
                            {isSelected ? (
                              <Ionicons name="checkmark" size={14} />
                            ) : (
                              <Ionicons name="add" size={14} />
                            )}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))
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

          {/* Final Split Summary */}
          {currentInvoice.totals && currentInvoice.totals.length > 0 && (
            <View className="mt-8">
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: colors.text.primary,
                  marginBottom: 16,
                }}
              >
                Final Split
              </Text>
              <View
                style={{
                  backgroundColor: colors.background.secondary,
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                {currentInvoice.totals.map((person) => (
                  <View
                    key={person.name}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <View className="flex-row items-center">
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          backgroundColor: colors.accent.light,
                          borderRadius: 20,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Text
                          style={{
                            color: colors.accent.primary,
                            fontWeight: "bold",
                          }}
                        >
                          {person.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: colors.text.primary,
                          fontWeight: "600",
                          fontSize: 18,
                        }}
                      >
                        {person.name}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: colors.accent.primary,
                        fontWeight: "bold",
                        fontSize: 24,
                      }}
                    >
                      ${person.total.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Total */}
              <View
                style={{
                  marginTop: 16,
                  backgroundColor: colors.accent.primary,
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    style={{
                      color: colors.text.inverse,
                      fontWeight: "bold",
                      fontSize: 20,
                    }}
                  >
                    Total
                  </Text>
                  <Text
                    style={{
                      color: colors.text.inverse,
                      fontWeight: "bold",
                      fontSize: 30,
                    }}
                  >
                    ${calculateTotalAmount().toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
