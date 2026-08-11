import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useInvoiceStore } from "../../../shared/stores/invoiceStore";
import { Invoice } from "../../../shared/types/invoice";
import {
  confirmDeleteReceipt,
  showDeleteReceiptFailedAlert,
} from "../../../shared/utils/receiptAlerts";

export const useReceiptsManagement = () => {
  const router = useRouter();
  const {
    savedInvoices,
    loadSavedInvoices,
    setInvoice,
    setPeople,
    calculateTotals,
    setEditingSavedInvoice,
    deleteSavedInvoice,
  } = useInvoiceStore();

  useEffect(() => {
    loadSavedInvoices();
  }, [loadSavedInvoices]);

  const handleOpenSavedInvoice = (invoice: Invoice) => {
    const cloned: Invoice = {
      ...invoice,
      people: [...invoice.people],
      items: invoice.items.map((item) => ({
        ...item,
        splitBetween: [...item.splitBetween],
      })),
      totals: invoice.totals.map((person) => ({ ...person })),
      paidBy: invoice.paidBy ?? [],
    };
    setPeople(cloned.people);
    setInvoice(cloned);
    calculateTotals();
    setEditingSavedInvoice(true);
    router.push("/assign-items");
  };

  const handleStartNew = () => {
    router.push("/(tabs)/mates");
  };

  const handleDeleteSavedInvoice = (invoice: Invoice) => {
    confirmDeleteReceipt(() => {
      deleteSavedInvoice(invoice.id).catch(showDeleteReceiptFailedAlert);
    });
  };

  return {
    savedInvoices,
    handleOpenSavedInvoice,
    handleStartNew,
    handleDeleteSavedInvoice,
  };
};
