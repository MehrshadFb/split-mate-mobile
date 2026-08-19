import React, { createRef, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import ReanimatedSwipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { CARD_STYLES, ICON_SIZE, SPACING } from "../../../shared/constants/design";
import { useTheme } from "../../../shared/contexts/ThemeContext";
import { Invoice } from "../../../shared/types/invoice";
import { ReceiptCard } from "./ReceiptCard";

interface ReceiptsListProps {
  invoices: Invoice[];
  onSelectInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (invoice: Invoice) => void;
  getTitle: (invoice: Invoice) => string;
  formatDate: (invoice: Invoice) => string;
}

export const ReceiptsList: React.FC<ReceiptsListProps> = ({
  invoices,
  onSelectInvoice,
  onDeleteInvoice,
  getTitle,
  formatDate,
}) => {
  const { colors } = useTheme();
  // Only one row may stay open: opening a row closes the previous one.
  const openRow = useRef<SwipeableMethods | null>(null);
  const rowRefs = useRef(
    new Map<string, React.RefObject<SwipeableMethods | null>>()
  );

  const getRowRef = (id: string) => {
    let ref = rowRefs.current.get(id);
    if (!ref) {
      ref = createRef<SwipeableMethods | null>();
      rowRefs.current.set(id, ref);
    }
    return ref;
  };

  const renderDeleteAction = (
    invoice: Invoice,
    swipeable: SwipeableMethods
  ) => (
    <TouchableOpacity
      onPress={() => {
        swipeable.close();
        onDeleteInvoice(invoice);
      }}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Delete ${getTitle(invoice)}`}
      style={{
        width: 72,
        marginLeft: SPACING.md,
        marginBottom: CARD_STYLES.marginBottom,
        borderRadius: CARD_STYLES.borderRadius,
        backgroundColor: colors.error,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons
        name="trash-outline"
        size={ICON_SIZE.lg}
        color={colors.text.inverse}
      />
    </TouchableOpacity>
  );

  return (
    <View>
      {invoices.map((invoice) => {
        const rowRef = getRowRef(invoice.id);
        return (
          <ReanimatedSwipeable
            key={invoice.id}
            ref={rowRef}
            friction={2}
            rightThreshold={40}
            overshootRight={false}
            onSwipeableWillOpen={() => {
              if (openRow.current && openRow.current !== rowRef.current) {
                openRow.current.close();
              }
              openRow.current = rowRef.current;
            }}
            onSwipeableClose={() => {
              if (openRow.current === rowRef.current) {
                openRow.current = null;
              }
            }}
            renderRightActions={(_progress, _translation, swipeable) =>
              renderDeleteAction(invoice, swipeable)
            }
          >
            <ReceiptCard
              invoice={invoice}
              title={getTitle(invoice)}
              formattedDate={formatDate(invoice)}
              onPress={() => onSelectInvoice(invoice)}
            />
          </ReanimatedSwipeable>
        );
      })}
    </View>
  );
};
