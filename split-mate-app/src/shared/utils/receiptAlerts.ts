import { Alert } from "react-native";

export const confirmDeleteReceipt = (onConfirm: () => void) => {
  Alert.alert(
    "Delete Receipt",
    "Are you sure you want to delete this receipt? This action cannot be undone.",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onConfirm },
    ]
  );
};

export const showDeleteReceiptFailedAlert = () => {
  Alert.alert(
    "Delete Failed",
    "We couldn't delete this receipt. Please try again."
  );
};
