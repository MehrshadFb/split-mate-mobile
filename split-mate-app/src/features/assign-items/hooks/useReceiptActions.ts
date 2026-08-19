import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { useInvoiceStore } from "../../../shared/stores/invoiceStore";
import { Invoice } from "../../../shared/types/invoice";
import { getLocalDateString } from "../../../shared/utils/dateUtils";
import {
  confirmDeleteReceipt,
  showDeleteReceiptFailedAlert,
} from "../../../shared/utils/receiptAlerts";

export const useReceiptActions = (
  getDisplayTitle: () => string,
  isEditingTitle: boolean,
  tempTitle: string
) => {
  const router = useRouter();
  const {
    currentInvoice,
    people,
    resetSession,
    clearInvoice,
    editingSavedInvoice,
    setEditingSavedInvoice,
    loadSavedInvoices,
    setPeople,
    deleteSavedInvoice,
    setInvoice,
    calculateTotals,
    setInvoiceTitle,
    flushPendingSave,
  } = useInvoiceStore();

  const clearExistingSession = useCallback(() => {
    setEditingSavedInvoice(false);
    clearInvoice();
    setPeople([]);
  }, [setEditingSavedInvoice, clearInvoice, setPeople]);

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
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(tabs)/receipts");
        }
      } else {
        resetSession();
        router.replace("/(tabs)/receipts");
      }
    },
    [loadSavedInvoices, clearExistingSession, resetSession, router]
  );

  // Initialize empty invoice if none exists (for manual entry)
  useEffect(() => {
    if (!currentInvoice && people.length > 0) {
      const now = new Date();
      const emptyInvoice: Invoice = {
        id: `invoice-${Date.now()}`,
        date: getLocalDateString(),
        items: [],
        people: people,
        totals: [],
        paidBy: [],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        totalAmount: 0,
      };
      setInvoice(emptyInvoice);
    }
  }, [currentInvoice, people, setInvoice]);

  const skipInitialTotals = useRef(editingSavedInvoice);

  // Calculate totals whenever items change (skip once for pre-computed saved receipts)
  useEffect(() => {
    if (skipInitialTotals.current) {
      skipInitialTotals.current = false;
      return;
    }
    if (currentInvoice?.items.length) {
      calculateTotals();
    }
  }, [currentInvoice?.items, calculateTotals]);

  const finishAndExit = useCallback(
    async (resetType: "new" | "existing") => {
      if (isEditingTitle && tempTitle.trim() !== getDisplayTitle()) {
        setInvoiceTitle(tempTitle.trim());
      }
      await flushPendingSave();
      navigateToList(resetType);
    },
    [
      isEditingTitle,
      tempTitle,
      getDisplayTitle,
      setInvoiceTitle,
      navigateToList,
      flushPendingSave,
    ]
  );

  const handleDone = useCallback(async () => {
    await finishAndExit(editingSavedInvoice ? "existing" : "new");
  }, [finishAndExit, editingSavedInvoice]);

  const handleBack = useCallback(async () => {
    await flushPendingSave();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/receipts");
    }
  }, [router, flushPendingSave]);

  const handleDeleteReceipt = useCallback(async () => {
    if (!currentInvoice?.id) return;
    confirmDeleteReceipt(async () => {
      try {
        await deleteSavedInvoice(currentInvoice.id);
        navigateToList("existing");
      } catch {
        showDeleteReceiptFailedAlert();
      }
    });
  }, [currentInvoice, deleteSavedInvoice, navigateToList]);

  return {
    handleDone,
    handleBack,
    handleDeleteReceipt,
  };
};
