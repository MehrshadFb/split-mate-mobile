import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";
import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, ICON_SIZE, SPACING } from "../../../shared/constants/design";
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
    <View style={{ marginBottom: SPACING["2xl"] }}>
      <Text
        style={{
          fontSize: FONT_SIZE.sm,
          fontWeight: FONT_WEIGHT.semibold,
          color: colors.text.secondary,
          marginBottom: SPACING.sm,
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
          padding: SPACING.lg,
          backgroundColor: colors.background.primary,
          borderRadius: BORDER_RADIUS.md,
          borderWidth: 2,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            fontSize: FONT_SIZE.base,
            fontWeight: FONT_WEIGHT.semibold,
            color: colors.text.primary,
          }}
        >
          {formatDate(value)}
        </Text>
        <Ionicons
          name="calendar-outline"
          size={ICON_SIZE.md + 2}
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
                borderTopLeftRadius: BORDER_RADIUS.xl,
                borderTopRightRadius: BORDER_RADIUS.xl,
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
              <View style={{ paddingHorizontal: SPACING.xl }}>
                <TouchableOpacity
                  onPress={() => setShowPicker(false)}
                  style={{
                    padding: SPACING.lg,
                    backgroundColor: colors.accent.primary,
                    borderRadius: BORDER_RADIUS.md,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: colors.text.inverse,
                      fontSize: FONT_SIZE.base,
                      fontWeight: FONT_WEIGHT.semibold,
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
