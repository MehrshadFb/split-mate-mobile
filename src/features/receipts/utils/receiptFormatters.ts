// src/features/receipts/utils/receiptFormatters.ts
// Utility functions for formatting receipt data

import { Invoice } from "../../../shared/types/invoice";

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
  // Generate default title based on date
  const date = new Date(invoice.createdAt || Date.now());
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();
  return `Receipt ${month} ${day}`;
};
