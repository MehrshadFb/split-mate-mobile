// src/features/receipts/components/ReceiptsList.tsx
// List of saved receipts

import React from "react";
import { View } from "react-native";
import { Invoice } from "../../../shared/types/invoice";
import { ReceiptCard } from "./ReceiptCard";

interface ReceiptsListProps {
  invoices: Invoice[];
  onSelectInvoice: (invoice: Invoice) => void;
  getTitle: (invoice: Invoice) => string;
  formatDate: (invoice: Invoice) => string;
}

export const ReceiptsList: React.FC<ReceiptsListProps> = ({
  invoices,
  onSelectInvoice,
  getTitle,
  formatDate,
}) => {
  return (
    <View>
      {invoices.map((invoice) => (
        <ReceiptCard
          key={invoice.id}
          invoice={invoice}
          title={getTitle(invoice)}
          formattedDate={formatDate(invoice)}
          onPress={() => onSelectInvoice(invoice)}
        />
      ))}
    </View>
  );
};
