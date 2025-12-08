// app/assign-items.tsx
// Items assignment screen - assign items to people (NOT a tab)

import { Ionicons } from "@expo/vector-icons";
import { usePreventRemove } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../src/contexts/ThemeContext";
import { Button } from "../src/shared/components/Button";
import { useInvoiceStore } from "../src/stores/invoiceStore";
import { Invoice, Item } from "../src/types/invoice";

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
    setInvoice,
    calculateTotals,
    setHasUnsavedChanges,
    setInvoiceTitle,
  } = useInvoiceStore();

  const clearExistingSession = useCallback(() => {
    setEditingSavedInvoice(false);
    clearInvoice();
    setPeople([]);
  }, [setEditingSavedInvoice, clearInvoice, setPeople]);

  // Clear session on unmount if editing existing invoice
  useEffect(() => {
    return () => {
      if (editingSavedInvoice) {
        clearExistingSession();
      }
    };
  }, [editingSavedInvoice, clearExistingSession]);

  const [editingItem, setEditingItem] = useState<{
    index: number;
    name: string;
    price: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showManagePeople, setShowManagePeople] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");

  const navigateToList = useCallback(
    (resetType: "new" | "existing") => {
      loadSavedInvoices();

      if (resetType === "existing") {
        clearExistingSession();
        // For existing receipts, go back with animation
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(tabs)/receipts");
        }
      } else {
        // For new receipts, navigate to receipts tab to show the saved list
        resetSession();
        router.replace("/(tabs)/receipts");
      }
    },
    [loadSavedInvoices, clearExistingSession, resetSession, router]
  );

  const handleSaveInvoice = useCallback(async () => {
    if (!currentInvoice) {
      return false;
    }

    // If title is being edited and has changed, save it first
    if (isEditingTitle && tempTitle.trim() !== getDisplayTitle()) {
      setInvoiceTitle(tempTitle.trim());
      setIsEditingTitle(false);
      setTempTitle("");
    }

    // Allow saving even with 0 items - user can add items later
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
  }, [
    currentInvoice,
    saveCurrentInvoice,
    navigateToList,
    editingSavedInvoice,
    isEditingTitle,
    tempTitle,
    setInvoiceTitle,
  ]);

  usePreventRemove(hasUnsavedChanges, ({ data }) => {
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
            navigation.dispatch(data.action);
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

  // Initialize empty invoice if none exists (for manual entry)
  useEffect(() => {
    if (!currentInvoice && people.length > 0) {
      const emptyInvoice: Invoice = {
        id: `invoice-${Date.now()}`,
        items: [],
        people: people,
        totals: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalAmount: 0,
      };
      setInvoice(emptyInvoice);
    }
  }, [currentInvoice, people, setInvoice]);

  // Calculate totals whenever items change
  useEffect(() => {
    if (currentInvoice?.items.length) {
      calculateTotals();
    }
  }, [currentInvoice?.items, calculateTotals]);

  if (!currentInvoice) {
    return null;
  }

  const handleSaveEdit = () => {
    if (!editingItem) return;

    const price =
      editingItem.price.trim() === "" ? 0 : parseFloat(editingItem.price);
    const name =
      editingItem.name.trim() === ""
        ? `Item #${editingItem.index + 1}`
        : editingItem.name;

    updateItem(editingItem.index, {
      name,
      price: isNaN(price) ? 0 : price,
    });
    setEditingItem(null);
  };
  const handleAddItem = () => {
    const itemNumber = currentInvoice.items.length + 1;
    const newItem: Item = {
      name: `Item #${itemNumber}`,
      price: 0,
      splitBetween: [],
    };
    addItem(newItem);
  };

  const totalAmount = currentInvoice.items.reduce(
    (sum, item) => sum + item.price,
    0
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/receipts");
    }
  };

  const handleDeleteReceipt = async () => {
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

  const getDisplayTitle = () => {
    if (currentInvoice?.title) {
      return currentInvoice.title;
    }
    // Generate default title based on date
    const date = new Date(currentInvoice?.createdAt || Date.now());
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `Receipt ${month} ${day}`;
  };

  const handleStartEditingTitle = () => {
    setTempTitle(getDisplayTitle());
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    if (!isEditingTitle) return;

    const trimmed = tempTitle.trim();
    const currentTitle = getDisplayTitle();

    // Only update if the title actually changed and is not empty
    if (trimmed && trimmed !== currentTitle) {
      setInvoiceTitle(trimmed);
      // Mark as unsaved change when editing a saved receipt
      if (editingSavedInvoice) {
        setHasUnsavedChanges(true);
      }
    }
    setIsEditingTitle(false);
    setTempTitle("");
  };

  const handleCancelEditingTitle = () => {
    setIsEditingTitle(false);
    setTempTitle("");
  };

  const handleAddPerson = () => {
    const trimmedName = newPersonName.trim();
    if (!trimmedName) {
      return;
    }

    const nameExists = people.some(
      (mate) => mate.toLowerCase() === trimmedName.toLowerCase()
    );

    if (nameExists) {
      Alert.alert("Duplicate name", "This person is already on the list.");
      return;
    }

    // Add person to both the people array and the current invoice
    const updatedPeople = [...people, trimmedName];
    setPeople(updatedPeople);

    // Update the current invoice's people array
    if (currentInvoice) {
      setInvoice({
        ...currentInvoice,
        people: updatedPeople,
      });
    }

    // Recalculate totals to include the new person with $0
    calculateTotals();

    // Mark as unsaved change when editing a saved receipt
    if (editingSavedInvoice) {
      setHasUnsavedChanges(true);
    }
    setNewPersonName("");
  };

  const handleRemovePerson = (personName: string) => {
    // Check if removing this person would leave fewer than 2 people
    if (people.length <= 2) {
      Alert.alert(
        "Cannot Remove",
        "You need at least 2 people to split a receipt.",
        [{ text: "OK" }]
      );
      return;
    }

    // Check if person is assigned to any items
    const hasAssignedItems = currentInvoice.items.some((item) =>
      item.splitBetween.includes(personName)
    );

    if (hasAssignedItems) {
      Alert.alert(
        "Cannot Remove",
        `${personName} is assigned to one or more items. Remove them from all items first.`,
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert("Remove Person", `Remove ${personName} from this receipt?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const updatedPeople = people.filter((p) => p !== personName);
          setPeople(updatedPeople);

          // Update the current invoice's people array
          if (currentInvoice) {
            setInvoice({
              ...currentInvoice,
              people: updatedPeople,
            });
          }

          // Recalculate totals to remove the person from the summary
          calculateTotals();

          // Mark as unsaved change when editing a saved receipt
          if (editingSavedInvoice) {
            setHasUnsavedChanges(true);
          }
        },
      },
    ]);
  };

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

          {/* Editable Receipt Title */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.text.secondary,
                marginBottom: 8,
                textTransform: "uppercase",
              }}
            >
              Receipt Name
            </Text>
            <TextInput
              value={isEditingTitle ? tempTitle : getDisplayTitle()}
              onFocus={() => {
                if (!isEditingTitle) {
                  setTempTitle(getDisplayTitle());
                  setIsEditingTitle(true);
                }
              }}
              onChangeText={(text) => {
                if (!isEditingTitle) {
                  setTempTitle(text);
                  setIsEditingTitle(true);
                } else {
                  setTempTitle(text);
                }
              }}
              onBlur={() => {
                if (isEditingTitle) {
                  handleSaveTitle();
                }
              }}
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: colors.text.primary,
                padding: 16,
                backgroundColor: colors.background.primary,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: isEditingTitle
                  ? colors.accent.primary
                  : colors.border,
              }}
              placeholder="Enter receipt name"
              placeholderTextColor={colors.text.secondary}
            />
          </View>

          {/* Manage People Section */}
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
            {/* Header - Collapsible */}
            <TouchableOpacity
              onPress={() => setShowManagePeople(!showManagePeople)}
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
                  <Ionicons
                    name="people"
                    size={22}
                    color={colors.accent.primary}
                  />
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
                name={showManagePeople ? "chevron-up" : "chevron-down"}
                size={24}
                color={colors.text.tertiary}
              />
            </TouchableOpacity>

            {/* Expandable Content */}
            {showManagePeople && (
              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  padding: 18,
                }}
              >
                {/* Add Person Input */}
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
                      onChangeText={setNewPersonName}
                      onSubmitEditing={handleAddPerson}
                      returnKeyType="done"
                      autoCapitalize="words"
                    />
                    <TouchableOpacity
                      onPress={handleAddPerson}
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

                {/* People List */}
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
                          onPress={() => handleRemovePerson(person)}
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
                            value={editingItem.price}
                            onChangeText={(text) => {
                              // Allow empty string, numbers, and decimal point
                              const validInput = /^\d*\.?\d{0,2}$/;
                              if (text === "" || validInput.test(text)) {
                                setEditingItem({
                                  ...editingItem,
                                  price: text,
                                });
                              }
                            }}
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
                              Save
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
                                    price:
                                      item.price === 0
                                        ? ""
                                        : item.price.toString(),
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
          {currentInvoice.items.length > 0 &&
            currentInvoice.totals?.length > 0 && (
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
                        ${totalAmount.toFixed(2)}
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
                </View>
              </View>
            )}

          {/* Save Button - Always visible */}
          <View style={{ marginTop: 32, marginBottom: 20 }}>
            <Button
              title={editingSavedInvoice ? "Update Receipt" : "Save Receipt"}
              onPress={handleSaveInvoice}
              variant="primary"
              size="large"
              fullWidth
              loading={isSaving}
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
      </ScrollView>
    </SafeAreaView>
  );
}
