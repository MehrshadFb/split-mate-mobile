import { Alert } from "react-native";
import { ALLOWED_TYPES, MAX_FILE_SIZE } from "../constants/validation";

export const validateFile = (
  uri: string,
  type: string,
  size?: number
): boolean => {
  if (!ALLOWED_TYPES.some((allowed) => type.includes(allowed))) {
    Alert.alert(
      "Unsupported File",
      "Please select a JPG or PNG image under 10 MB."
    );
    return false;
  }
  if (size && size > MAX_FILE_SIZE) {
    Alert.alert("File Too Large", "Please select an image under 10 MB.");
    return false;
  }
  return true;
};
