// src/features/assign-items/hooks/useReceiptActions.ts
// Hook for managing receipt actions (save/delete/navigation)

import { usePreventRemove } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useInvoiceStore } from "../../../shared/stores/invoiceStore";
import { Invoice } from "../../../shared/types/invoice";

export const useReceiptActions = (
  getDisplayTitle: () => string,
  isEditingTitle: boolean,
  tempTitle: string
) => {
  const router = useRouter();
  const navigation = useNavigation();
  const {
    currentInvoice,
    people,
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
    setInvoiceTitle,
  } = useInvoiceStore();

  const [isSaving, setIsSaving] = useState(false);

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
    getDisplayTitle,
  ]);

  // Prevent navigation with unsaved changes
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
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const emptyInvoice: Invoice = {
        id: `invoice-${Date.now()}`,
        date: today,
        items: [],
        people: people,
        totals: [],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
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

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/receipts");
    }
  }, [router]);

  const handleDeleteReceipt = useCallback(async () => {
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
  }, [currentInvoice, deleteSavedInvoice, navigateToList]);

  return {
    isSaving,
    handleSaveInvoice,
    handleBack,
    handleDeleteReceipt,
  };
};
