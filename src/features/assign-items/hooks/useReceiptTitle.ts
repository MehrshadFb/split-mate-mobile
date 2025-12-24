// src/features/assign-items/hooks/useReceiptTitle.ts
// Hook for managing receipt title editing

import { useCallback, useState } from "react";
import { useInvoiceStore } from "../../../shared/stores/invoiceStore";

export const useReceiptTitle = () => {
  const { currentInvoice, setInvoiceTitle, editingSavedInvoice, setHasUnsavedChanges } = useInvoiceStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");

  const getDisplayTitle = useCallback(() => {
    if (currentInvoice?.title) {
      return currentInvoice.title;
    }
    return "Receipt";
  }, [currentInvoice]);

  const handleStartEditingTitle = useCallback(() => {
    if (!isEditingTitle) {
      setTempTitle(getDisplayTitle());
      setIsEditingTitle(true);
    }
  }, [isEditingTitle, getDisplayTitle]);

  const handleSaveTitle = useCallback(() => {
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
  }, [isEditingTitle, tempTitle, getDisplayTitle, setInvoiceTitle, editingSavedInvoice, setHasUnsavedChanges]);

  const handleChangeTitleText = useCallback((text: string) => {
    if (!isEditingTitle) {
      setTempTitle(text);
      setIsEditingTitle(true);
    } else {
      setTempTitle(text);
    }
  }, [isEditingTitle]);

  return {
    isEditingTitle,
    tempTitle,
    getDisplayTitle,
    handleStartEditingTitle,
    handleSaveTitle,
    handleChangeTitleText,
  };
};
