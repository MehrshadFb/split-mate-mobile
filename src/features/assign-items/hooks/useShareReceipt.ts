// src/features/assign-items/hooks/useShareReceipt.ts
// Hook for sharing receipt as PDF

import { File, Paths } from "expo-file-system";
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

/**
 * Generates a safe filename from invoice title and date
 * @param title - Invoice title
 * @param date - Invoice date
 * @returns Sanitized filename
 */
function generateFileName(title: string, date: string): string {
  // Format date as YYYY-MM-DD
  const formattedDate = new Date(date).toISOString().split("T")[0];
  
  // Sanitize title: remove special characters, replace spaces with underscores
  const sanitizedTitle = (title || "Receipt")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 50); // Limit length
  
  return `${sanitizedTitle}_${formattedDate}.pdf`;
}

/**
 * Hook for generating and sharing receipt PDFs
 * Handles PDF generation, file creation, and native sharing
 */
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

      // Generate proper filename
      const fileName = generateFileName(invoice.title || "Receipt", invoice.date);
      const targetFile = new File(Paths.cache, fileName);
      
      // Create a file instance from the generated PDF URI and copy it with proper name
      const sourceFile = new File(uri);
      sourceFile.copy(targetFile);

      // Share the PDF file with proper filename
      await Sharing.shareAsync(targetFile.uri, {
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
