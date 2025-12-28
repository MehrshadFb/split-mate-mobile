// src/features/assign-items/hooks/usePeopleManagement.ts
// Hook for managing people in assign-items screen

import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useInvoiceStore } from "../../../shared/stores/invoiceStore";
import { MIN_PEOPLE_REQUIRED } from "../constants";

export const usePeopleManagement = () => {
  const {
    currentInvoice,
    people,
    setPeople,
    setInvoice,
    calculateTotals,
    editingSavedInvoice,
    setHasUnsavedChanges,
  } = useInvoiceStore();

  const [showManagePeople, setShowManagePeople] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");

  const handleAddPerson = useCallback(() => {
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
  }, [
    newPersonName,
    people,
    currentInvoice,
    setPeople,
    setInvoice,
    calculateTotals,
    editingSavedInvoice,
    setHasUnsavedChanges,
  ]);

  const handleRemovePerson = useCallback(
    (personName: string) => {
      // Check if removing this person would leave fewer than 2 people
      if (people.length <= MIN_PEOPLE_REQUIRED) {
        Alert.alert(
          "Cannot Remove",
          "You need at least 2 people to split a receipt.",
          [{ text: "OK" }]
        );
        return;
      }

      // Check if person is assigned to any items
      const hasAssignedItems = currentInvoice?.items.some((item) =>
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

      Alert.alert(
        "Remove Person",
        `Remove ${personName} from this receipt?`,
        [
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
        ]
      );
    },
    [
      people,
      currentInvoice,
      setPeople,
      setInvoice,
      calculateTotals,
      editingSavedInvoice,
      setHasUnsavedChanges,
    ]
  );

  return {
    showManagePeople,
    setShowManagePeople,
    newPersonName,
    setNewPersonName,
    handleAddPerson,
    handleRemovePerson,
  };
};
