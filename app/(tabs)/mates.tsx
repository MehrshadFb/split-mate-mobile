// app/(tabs)/mates.tsx
// People setup screen - who's splitting the bill

import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/Button";
import { useTheme } from "../../src/contexts/ThemeContext";
import { useInvoiceStore } from "../../src/stores/invoiceStore";

export default function MatesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { people, addPerson, removePerson } = useInvoiceStore();
  const [newPersonName, setNewPersonName] = useState("");

  const handleAddPerson = () => {
    if (newPersonName.trim()) {
      addPerson(newPersonName.trim());
      setNewPersonName("");
    }
  };

  const handleContinue = () => {
    if (people.length < 2) {
      alert("Please add at least 2 mates to split the bill.");
      return;
    }
    router.push("/(tabs)/list");
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 p-6">
          {/* Header */}
          <View className="mb-8">
            <Text
              style={{
                fontSize: 36,
                fontWeight: "bold",
                color: colors.text.primary,
                marginBottom: 8,
              }}
            >
              Who's Splitting?
            </Text>
            <Text style={{ fontSize: 18, color: colors.text.secondary }}>
              Add the names of everyone sharing this bill
            </Text>
          </View>

          {/* Input */}
          <View className="flex-row mb-6">
            <TextInput
              style={{
                flex: 1,
                backgroundColor: colors.background.secondary,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: colors.text.primary,
                fontSize: 16,
                marginRight: 8,
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
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: colors.text.inverse,
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                Add
              </Text>
            </TouchableOpacity>
          </View>

          {/* People List */}
          {people.length > 0 && (
            <View className="flex-1 mb-6">
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: colors.text.primary,
                  marginBottom: 12,
                }}
              >
                People ({people.length})
              </Text>
              <FlatList
                data={people}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={({ item, index }) => (
                  <View
                    style={{
                      backgroundColor: colors.background.secondary,
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
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
                          {item.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: colors.text.primary,
                          fontWeight: "500",
                          fontSize: 16,
                        }}
                      >
                        {item}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removePerson(item)}
                      className="p-2"
                      activeOpacity={0.7}
                    >
                      <Text
                        style={{
                          color: colors.error,
                          fontSize: 20,
                          fontWeight: "bold",
                        }}
                      >
                        ×
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {/* Empty State */}
          {people.length === 0 && (
            <View className="flex-1 items-center justify-center">
              <Text
                style={{
                  color: colors.text.tertiary,
                  textAlign: "center",
                  fontSize: 16,
                }}
              >
                No people added yet.{"\n"}
                Add at least 2 people to continue.
              </Text>
            </View>
          )}

          {/* Continue Button */}
          <View className="pt-4">
            <Button
              title="Continue"
              onPress={handleContinue}
              variant="primary"
              size="large"
              fullWidth
              disabled={people.length < 2}
            />
            {people.length < 2 && (
              <Text
                style={{
                  fontSize: 14,
                  color: colors.text.tertiary,
                  textAlign: "center",
                  marginTop: 8,
                }}
              >
                Add at least 2 people to continue
              </Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
