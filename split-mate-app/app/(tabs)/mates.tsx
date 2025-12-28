// app/(tabs)/mates.tsx
// Mates management screen - add/remove people for bill splitting

import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/shared/contexts/ThemeContext";
import {
  AddMateInput,
  EmptyMatesState,
  MatesHeader,
  MatesList,
  MIN_MATES_REQUIRED,
  useMatesManagement,
} from "../../src/features/mates";
import { Button } from "../../src/shared/components/Button";

export default function MatesScreen() {
  const { colors } = useTheme();
  const {
    people,
    newPersonName,
    setNewPersonName,
    handleAddPerson,
    handleRemovePerson,
    handleContinue,
    canContinue,
  } = useMatesManagement();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <MatesHeader
            title="Who's Splitting?"
            subtitle="Add everyone who's sharing this bill."
          />
          {/* Add Mate Input */}
          <AddMateInput
            value={newPersonName}
            onChangeText={setNewPersonName}
            onSubmit={handleAddPerson}
          />
          {/* Mates List or Empty State */}
          {people.length > 0 ? (
            <MatesList people={people} onRemove={handleRemovePerson} />
          ) : (
            <EmptyMatesState minRequired={MIN_MATES_REQUIRED} />
          )}
          {/* Continue Button */}
          <View style={{ paddingTop: 12 }}>
            <Button
              title="Continue"
              onPress={handleContinue}
              variant="primary"
              size="large"
              fullWidth
              disabled={!canContinue}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
