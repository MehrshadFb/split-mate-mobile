// src/features/assign-items/hooks/useShareReceipt.ts
// Hook for sharing receipt as PDF

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Alert } from "react-native";
import { Invoice } from "../../../shared/types/invoice";
import { generateReceiptHTML } from "../../../shared/utils/pdfGenerator";

interface UseShareReceiptReturn {
  isGenerating: boolean;
  shareReceipt: (invoice: Invoice) => Promise<void>;
}

export function useShareReceipt(): UseShareReceiptReturn {
  const [isGenerating, setIsGenerating] = useState(false);

  const shareReceipt = async (invoice: Invoice): Promise<void> => {
    try {
      setIsGenerating(true);

      // Check if sharing is available on this device
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) {
        Alert.alert(
          "Sharing Not Available",
          "Sharing is not available on this device."
        );
        return;
      }

      // Generate HTML content
      const html = generateReceiptHTML(invoice);

      // Generate PDF from HTML
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // Share the PDF file
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `Share ${invoice.title || "Receipt"}`,
        UTI: "com.adobe.pdf", // iOS Universal Type Identifier
      });
    } catch (error) {
      console.error("Error sharing receipt:", error);
      
      // Show user-friendly error message
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      
      Alert.alert(
        "Share Failed",
        `Unable to share receipt: ${errorMessage}. Please try again.`,
        [{ text: "OK" }]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    shareReceipt,
  };
}
