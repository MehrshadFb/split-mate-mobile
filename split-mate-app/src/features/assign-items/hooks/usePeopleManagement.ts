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
    const updatedPeople = [...people, trimmedName];
    setPeople(updatedPeople);
    if (currentInvoice) {
      setInvoice({
        ...currentInvoice,
        people: updatedPeople,
      });
    }
    calculateTotals();
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
      // Precondition: Ensure minimum people requirement
      if (people.length <= MIN_PEOPLE_REQUIRED) {
        Alert.alert(
          "Cannot Remove",
          "You need at least 2 people to split a receipt.",
          [{ text: "OK" }]
        );
        return;
      }
      // If the person is assigned to any items, prevent removal
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
              if (currentInvoice) {
                setInvoice({
                  ...currentInvoice,
                  people: updatedPeople,
                });
              }
              calculateTotals();
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
