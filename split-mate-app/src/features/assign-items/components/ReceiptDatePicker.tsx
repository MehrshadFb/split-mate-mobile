// src/features/assign-items/components/ReceiptDatePicker.tsx
// Date picker for receipt date

import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../shared/contexts/ThemeContext";

interface ReceiptDatePickerProps {
  value: string;
  onChange: (date: string) => void;
}

export const ReceiptDatePicker: React.FC<ReceiptDatePickerProps> = ({
  value,
  onChange,
}) => {
  const { colors } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());

  const formatDate = (dateStr: string) => {
    if (!dateStr) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      dateStr = `${year}-${month}-${day}`;
    }
    const date = new Date(dateStr + "T00:00:00");
    if (isNaN(date.getTime())) {
      return "Select date";
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    if (selectedDate) {
      setPickerDate(selectedDate);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;
      onChange(dateString);
    }
  };

  const handleOpenPicker = () => {
    if (value) {
      const date = new Date(value + "T00:00:00");
      setPickerDate(isNaN(date.getTime()) ? new Date() : date);
    } else {
      setPickerDate(new Date());
    }
    setShowPicker(true);
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: colors.text.secondary,
          marginBottom: 8,
          textTransform: "uppercase",
        }}
      >
        Receipt Date
      </Text>
      <TouchableOpacity
        onPress={handleOpenPicker}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          backgroundColor: colors.background.primary,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            fontSize: 17,
            fontWeight: "600",
            color: colors.text.primary,
          }}
        >
          {formatDate(value)}
        </Text>
        <Ionicons
          name="calendar-outline"
          size={22}
          color={colors.accent.primary}
        />
      </TouchableOpacity>
      {/* Android: DateTimePicker opens as native dialog */}
      {showPicker && Platform.OS === "android" && (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
      {/* iOS: DateTimePicker in Modal with proper background */}
      {showPicker && Platform.OS === "ios" && (
        <Modal
          transparent
          animationType="slide"
          visible={showPicker}
          onRequestClose={() => setShowPicker(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: "flex-end",
            }}
            activeOpacity={1}
            onPress={() => setShowPicker(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={{
                backgroundColor: colors.background.secondary,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingBottom: 34,
                shadowColor: colors.text.primary,
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <DateTimePicker
                value={pickerDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                textColor={colors.text.primary}
              />
              <View style={{ paddingHorizontal: 20 }}>
                <TouchableOpacity
                  onPress={() => setShowPicker(false)}
                  style={{
                    padding: 16,
                    backgroundColor: colors.accent.primary,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: colors.text.inverse,
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};
