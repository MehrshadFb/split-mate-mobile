import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useInvoiceStore } from "../../../shared/stores/invoiceStore";
import { Invoice } from "../../../shared/types/invoice";

export const useReceiptsManagement = () => {
  const router = useRouter();
  const {
    savedInvoices,
    loadSavedInvoices,
    setInvoice,
    setPeople,
    calculateTotals,
    setEditingSavedInvoice,
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

  return {
    savedInvoices,
    handleOpenSavedInvoice,
    handleStartNew,
  };
};
