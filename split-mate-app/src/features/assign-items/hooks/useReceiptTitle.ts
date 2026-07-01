import { useCallback, useState } from "react";
import { useInvoiceStore } from "../../../shared/stores/invoiceStore";

export const useReceiptTitle = () => {
  const { currentInvoice, setInvoiceTitle } = useInvoiceStore();
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
    if (trimmed && trimmed !== currentTitle) {
      setInvoiceTitle(trimmed);
    }
    setIsEditingTitle(false);
    setTempTitle("");
  }, [isEditingTitle, tempTitle, getDisplayTitle, setInvoiceTitle]);

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
