import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/Button";
import { useTheme } from "../../src/contexts/ThemeContext";
import { useInvoiceStore } from "../../src/stores/invoiceStore";

const MIN_MATES_REQUIRED = 2;

export default function MatesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { people, addPerson, removePerson, setEditingSavedInvoice } =
    useInvoiceStore();
  const [newPersonName, setNewPersonName] = useState("");

  const handleAddPerson = () => {
    const trimmedName = newPersonName.trim();
    if (!trimmedName) {
      return;
    }

    const nameExists = people.some(
      (mate) => mate.toLowerCase() === trimmedName.toLowerCase()
    );

    if (nameExists) {
      Alert.alert("Duplicate name", "This mate is already on the list.");
      return;
    }

    addPerson(trimmedName);
    setNewPersonName("");
  };

  const handleContinue = () => {
    if (people.length < MIN_MATES_REQUIRED) {
      Alert.alert(
        "Add more mates",
        `Add at least ${MIN_MATES_REQUIRED} mates before continuing.`
      );
      return;
    }

    setEditingSavedInvoice(false);
    router.push("/(tabs)/upload");
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 36,
                fontWeight: "bold",
                color: colors.text.primary,
                marginBottom: 12,
              }}
            >
              Who's Splitting?
            </Text>
            <Text style={{ fontSize: 18, color: colors.text.secondary }}>
              Add everyone who’s sharing this bill.
            </Text>
          </View>

          <View style={{ flexDirection: "row", marginBottom: 20 }}>
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

          {people.length > 0 ? (
            <View style={{ marginBottom: 32 }}>
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
              {people.map((person) => (
                <View
                  key={person}
                  style={{
                    backgroundColor: colors.background.secondary,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 10,
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
                        {person.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontWeight: "500",
                        fontSize: 16,
                      }}
                    >
                      {person}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removePerson(person)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.background.secondary,
                borderRadius: 16,
                padding: 28,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 32,
              }}
            >
              <Ionicons
                name="people-outline"
                size={36}
                color={colors.text.tertiary}
              />
              <Text
                style={{
                  color: colors.text.primary,
                  fontWeight: "600",
                  fontSize: 18,
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                Add at least two mates
              </Text>
              <Text
                style={{
                  color: colors.text.secondary,
                  marginTop: 6,
                  textAlign: "center",
                }}
              >
                You’ll head to upload after everyone is listed.
              </Text>
            </View>
          )}

          <View style={{ paddingTop: 12 }}>
            <Button
              title="Continue"
              onPress={handleContinue}
              variant="primary"
              size="large"
              fullWidth
              disabled={people.length < MIN_MATES_REQUIRED}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
