import { useState } from "react";
import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import { Invoice } from "../../../shared/types/invoice";
import { generateReceiptHTML } from "../../../shared/utils/pdfGenerator";

interface UseShareReceiptReturn {
  isGenerating: boolean;
  shareReceipt: (invoice: Invoice) => Promise<void>;
}

function generateFileName(title: string, date: string): string {
  const formattedDate = new Date(date).toISOString().split("T")[0]; // YYYY-MM-DD
  const sanitizedTitle = (title || "Receipt")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 50); // Limit length
  return `${sanitizedTitle}_${formattedDate}.pdf`;
}

export function useShareReceipt(): UseShareReceiptReturn {
  const [isGenerating, setIsGenerating] = useState(false);

  const shareReceipt = async (invoice: Invoice): Promise<void> => {
    try {
      setIsGenerating(true);
      const isSharingAvailable = await Sharing.isAvailableAsync(); // Check sharing availability
      if (!isSharingAvailable) {
        Alert.alert(
          "Sharing Not Available",
          "Sharing is not available on this device."
        );
        return;
      }
      const html = generateReceiptHTML(invoice); // Generate HTML content for the receipt
      // Generate PDF from HTML
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });
      const fileName = generateFileName(invoice.title || "Receipt", invoice.date);
      const targetFile = new File(Paths.cache, fileName);
      // Delete existing file if it exists to avoid conflicts, it might cause issues on some cases
      if (targetFile.exists) {
        targetFile.delete();
      }
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
