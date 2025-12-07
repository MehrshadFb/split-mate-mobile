// src/features/mates/hooks/useMatesManagement.ts
// Hook for managing mates state and validation logic

import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { useInvoiceStore } from "../../../stores/invoiceStore";
import { MIN_MATES_REQUIRED } from "../constants/validation";

export const useMatesManagement = () => {
  const router = useRouter();
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

  const handleRemovePerson = (name: string) => {
    removePerson(name);
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
    router.push({
      pathname: "/upload",
    });
  };

  return {
    people,
    newPersonName,
    setNewPersonName,
    handleAddPerson,
    handleRemovePerson,
    handleContinue,
    canContinue: people.length >= MIN_MATES_REQUIRED,
  };
};
