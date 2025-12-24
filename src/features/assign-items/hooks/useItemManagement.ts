// src/features/assign-items/hooks/useItemManagement.ts
// Hook for managing items in assign-items screen

import { useCallback, useState } from "react";
import { useInvoiceStore } from "../../../shared/stores/invoiceStore";
import { Item } from "../../../shared/types/invoice";

interface EditingItem {
  index: number;
  name: string;
  price: string;
}

export const useItemManagement = () => {
  const { currentInvoice, addItem, updateItem, deleteItem, togglePersonForItem } =
    useInvoiceStore();

  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);

  const handleAddItem = useCallback(() => {
    if (!currentInvoice) return;

    const itemNumber = currentInvoice.items.length + 1;
    const newItem: Item = {
      name: `Item #${itemNumber}`,
      price: 0,
      splitBetween: [],
    };
    addItem(newItem);
  }, [currentInvoice, addItem]);

  const handleStartEdit = useCallback((index: number, item: Item) => {
    setEditingItem({
      index,
      name: item.name,
      price: item.price === 0 ? "" : item.price.toString(),
    });
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingItem) return;

    const price =
      editingItem.price.trim() === "" ? 0 : parseFloat(editingItem.price);
    const name =
      editingItem.name.trim() === ""
        ? `Item #${editingItem.index + 1}`
        : editingItem.name;

    updateItem(editingItem.index, {
      name,
      price: isNaN(price) ? 0 : price,
    });
    setEditingItem(null);
  }, [editingItem, updateItem]);

  const handleCancelEdit = useCallback(() => {
    setEditingItem(null);
  }, []);

  const handleChangeName = useCallback(
    (text: string) => {
      if (!editingItem) return;
      setEditingItem({ ...editingItem, name: text });
    },
    [editingItem]
  );

  const handleChangePrice = useCallback(
    (text: string) => {
      if (!editingItem) return;
      // Allow empty string, numbers, and decimal point
      const validInput = /^\d*\.?\d{0,2}$/;
      if (text === "" || validInput.test(text)) {
        setEditingItem({ ...editingItem, price: text });
      }
    },
    [editingItem]
  );

  const handleDeleteItem = useCallback(
    (index: number) => {
      deleteItem(index);
    },
    [deleteItem]
  );

  const handleTogglePerson = useCallback(
    (itemIndex: number, person: string) => {
      togglePersonForItem(itemIndex, person);
    },
    [togglePersonForItem]
  );

  return {
    editingItem,
    handleAddItem,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleChangeName,
    handleChangePrice,
    handleDeleteItem,
    handleTogglePerson,
  };
};
