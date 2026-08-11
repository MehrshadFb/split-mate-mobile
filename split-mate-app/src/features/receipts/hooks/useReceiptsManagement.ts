import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
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
    Alert.alert(
      "Delete Receipt",
      "Are you sure you want to delete this receipt? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteSavedInvoice(invoice.id).catch(() => {
              Alert.alert(
                "Delete Failed",
                "We couldn't delete this receipt. Please try again."
              );
            });
          },
        },
      ]
    );
  };

  return {
    savedInvoices,
    handleOpenSavedInvoice,
    handleStartNew,
    handleDeleteSavedInvoice,
  };
};
