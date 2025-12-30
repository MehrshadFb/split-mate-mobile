import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CameraButton,
  Divider,
  ErrorMessage,
  FilePickerButton,
  InfoCard,
  SelectedImagesList,
  UploadHeader,
  UploadStatusDisplay,
} from "../src/features/upload/components";
import { useImageSelection, useUpload } from "../src/features/upload/hooks";
import { Button } from "../src/shared/components/Button";
import { ICON_SIZE, SPACING } from "../src/shared/constants/design";
import { useTheme } from "../src/shared/contexts/ThemeContext";
import { useInvoiceStore } from "../src/shared/stores/invoiceStore";

export default function UploadScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { uploadReceipts, isLoading, uploadProgress, error, clearError } =
    useUpload();
  const { addItem, clearInvoice, setEditingSavedInvoice } = useInvoiceStore();
  const {
    selectedImages,
    handleTakePhoto,
    handleChooseFromLibrary,
    removeImage,
    clearImages,
  } = useImageSelection();

  const handleProceed = async () => {
    if (selectedImages.length === 0) return;

    clearError();

    const items = await uploadReceipts(selectedImages);

    if (items && items.length > 0) {
      clearInvoice();
      setEditingSavedInvoice(false);

      items.forEach((item) => {
        addItem({
          name: item.name,
          price: item.price,
          splitBetween: [],
        });
      });

      router.push("/assign-items");
    }
  };

  const handleRemoveImage = (index: number) => {
    removeImage(index);
    clearError();
  };

  const handleManualEntry = () => {
    clearInvoice();
    setEditingSavedInvoice(false);
    router.push("/assign-items");
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
      edges={["top", "left", "right"]}
    >
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: SPACING.xl }}>
          {/* Header */}
          <UploadHeader
            title="Upload Receipt"
            subtitle="Take a photo or choose from your library"
            onBack={() => router.back()}
          />
          {/* Take Photo */}
          <CameraButton onPress={handleTakePhoto} disabled={isLoading} />
          {/* Choose from Library */}
          <FilePickerButton
            onPress={handleChooseFromLibrary}
            disabled={isLoading}
          />
          {/* Selected Images List */}
          <SelectedImagesList
            images={selectedImages}
            onRemoveImage={handleRemoveImage}
            onProceed={handleProceed}
            isLoading={isLoading}
          />
          {/* Upload Status Display */}
          {isLoading && uploadProgress && (
            <UploadStatusDisplay uploadProgress={uploadProgress} />
          )}
          {/* Error Message */}
          {error && (
            <ErrorMessage
              error={error}
              onRetry={handleProceed}
              onDismiss={clearError}
            />
          )}
          <Divider text="or" />
          {/* Manual Entry Button */}
          <Button
            title="Add Items Manually"
            onPress={handleManualEntry}
            variant="outline"
            size="large"
            fullWidth
            disabled={isLoading}
            icon={
              <Ionicons
                name="create-outline"
                size={ICON_SIZE.md}
                color={colors.accent.primary}
              />
            }
          />
          <InfoCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

