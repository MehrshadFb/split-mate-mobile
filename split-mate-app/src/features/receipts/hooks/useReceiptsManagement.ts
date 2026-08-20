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
    openSavedInvoice,
    deleteSavedInvoice,
  } = useInvoiceStore();

  useEffect(() => {
    loadSavedInvoices();
  }, [loadSavedInvoices]);

  const handleOpenSavedInvoice = (invoice: Invoice) => {
    router.push("/assign-items");
    openSavedInvoice(invoice);
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
