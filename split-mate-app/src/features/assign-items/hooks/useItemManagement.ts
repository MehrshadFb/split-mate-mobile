import { useCallback } from "react";
import { useInvoiceStore } from "../../../shared/stores/invoiceStore";
import { Item } from "../../../shared/types/invoice";

export const useItemManagement = () => {
  const {
    currentInvoice,
    addItem,
    updateItem,
    deleteItem,
    togglePersonForItem,
    setItemShares,
  } = useInvoiceStore();

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

  const handleRenameItem = useCallback(
    (index: number, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      updateItem(index, { name: trimmed });
    },
    [updateItem]
  );

  const handleChangeItemPrice = useCallback(
    (index: number, price: number) => {
      if (!isFinite(price) || price < 0) return;
      updateItem(index, { price: Math.round(price * 100) / 100 });
    },
    [updateItem]
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

  const handleUpdateShares = useCallback(
    (itemIndex: number, shares: Record<string, number> | undefined) => {
      setItemShares(itemIndex, shares);
    },
    [setItemShares]
  );

  return {
    handleAddItem,
    handleRenameItem,
    handleChangeItemPrice,
    handleDeleteItem,
    handleTogglePerson,
    handleUpdateShares,
  };
};
