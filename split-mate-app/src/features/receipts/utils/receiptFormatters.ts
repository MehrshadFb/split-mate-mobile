import { Invoice } from "../../../shared/types/invoice";

export const formatReceiptDate = (dateStr: string): string => {
  if (!dateStr) {
    return "";
  }
  const date = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatSavedDate = (timestamp?: string): string => {
  if (!timestamp) {
    return "";
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const getReceiptTitle = (invoice: Invoice): string => {
  if (invoice.title) {
    return invoice.title;
  }
  return "Receipt"; // Default title if none provided
};
