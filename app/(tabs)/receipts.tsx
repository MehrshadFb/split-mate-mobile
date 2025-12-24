// app/(tabs)/receipts.tsx
// Saved receipts overview

import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  EmptyReceiptsState,
  formatReceiptDate,
  getReceiptTitle,
  ReceiptsHeader,
  ReceiptsList,
  useReceiptsManagement,
} from "../../src/features/receipts";
import { useTheme } from "../../src/shared/contexts/ThemeContext";

export default function ReceiptsScreen() {
  const { colors } = useTheme();
  const { savedInvoices, handleOpenSavedInvoice, handleStartNew } =
    useReceiptsManagement();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
      edges={["top", "left", "right"]}
    >
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 24 }}>
          {/* Header */}
          <ReceiptsHeader
            title="Saved Receipts"
            subtitle="Pick up a past split or keep everything organised."
          />
          {/* Receipts List or Empty State */}
          {savedInvoices.length === 0 ? (
            <EmptyReceiptsState onStartNew={handleStartNew} />
          ) : (
            <ReceiptsList
              invoices={savedInvoices}
              onSelectInvoice={handleOpenSavedInvoice}
              getTitle={getReceiptTitle}
              formatDate={(invoice) => formatReceiptDate(invoice.date)}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
