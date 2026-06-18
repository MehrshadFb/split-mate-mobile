import React from "react";
import { ScrollView, View } from "react-native";
import {
  EmptyReceiptsState,
  formatReceiptDate,
  getReceiptTitle,
  ReceiptsHeader,
  ReceiptsList,
  useReceiptsManagement,
} from "../../src/features/receipts";
import { SPACING } from "../../src/shared/constants/design";
import { useTheme } from "../../src/shared/contexts/ThemeContext";

export default function ReceiptsScreen() {
  const { colors } = useTheme();
  const { savedInvoices, handleOpenSavedInvoice, handleStartNew } =
    useReceiptsManagement();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={{ padding: SPACING.xl }}>
          {/* Header */}
          <ReceiptsHeader
            title="Saved Receipts"
            subtitle="Resume a previous split or review past expenses."
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
    </View>
  );
}
