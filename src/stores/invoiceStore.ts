// src/stores/invoiceStore.ts
// Zustand store for invoice state management

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { Invoice, Item, Person } from "../types/invoice";

interface InvoiceState {
  currentInvoice: Invoice | null;
  people: string[];
  savedInvoices: Invoice[];
  editingSavedInvoice: boolean;
  hasUnsavedChanges: boolean;

  // Actions
  setInvoice: (invoice: Invoice) => void;
  addPerson: (name: string) => void;
  removePerson: (name: string) => void;
  setPeople: (people: string[]) => void;
  updateItem: (index: number, item: Partial<Item>) => void;
  addItem: (item: Item) => void;
  deleteItem: (index: number) => void;
  togglePersonForItem: (itemIndex: number, personName: string) => void;
  calculateTotals: () => void;
  clearInvoice: () => void;
  resetSession: () => void;
  loadSavedInvoices: () => Promise<void>;
  saveCurrentInvoice: () => Promise<Invoice | null>;
  deleteSavedInvoice: (invoiceId: string) => Promise<void>;
  setEditingSavedInvoice: (value: boolean) => void;
  setHasUnsavedChanges: (value: boolean) => void;
}

const SAVED_INVOICES_KEY = "@splitmate:saved_invoices";

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  currentInvoice: null,
  people: [],
  savedInvoices: [],
  editingSavedInvoice: false,
  hasUnsavedChanges: false,

  setInvoice: (invoice) =>
    set({ currentInvoice: invoice, hasUnsavedChanges: false }),

  addPerson: (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    set((state) => ({
      people: [...state.people, trimmedName],
      hasUnsavedChanges: true,
    }));
  },

  removePerson: (name) => {
    set((state) => ({
      people: state.people.filter((p) => p !== name),
      hasUnsavedChanges: true,
    }));
  },

  setPeople: (people) => set({ people }),

  updateItem: (index, itemUpdate) => {
    set((state) => {
      if (!state.currentInvoice) return state;

      const newItems = [...state.currentInvoice.items];
      newItems[index] = { ...newItems[index], ...itemUpdate };

      return {
        currentInvoice: {
          ...state.currentInvoice,
          items: newItems,
        },
        hasUnsavedChanges: true,
      };
    });
    get().calculateTotals();
  },

  addItem: (item) => {
    set((state) => {
      if (!state.currentInvoice) {
        // Create new invoice if none exists
        const newInvoice: Invoice = {
          id: `invoice-${Date.now()}`,
          items: [item],
          people: state.people,
          totals: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalAmount: item.price,
        };
        return { currentInvoice: newInvoice };
      }

      return {
        currentInvoice: {
          ...state.currentInvoice,
          items: [...state.currentInvoice.items, item],
        },
        hasUnsavedChanges: true,
      };
    });
    get().calculateTotals();
  },

  deleteItem: (index) => {
    set((state) => {
      if (!state.currentInvoice) return state;

      const newItems = state.currentInvoice.items.filter((_, i) => i !== index);

      return {
        currentInvoice: {
          ...state.currentInvoice,
          items: newItems,
        },
        hasUnsavedChanges: true,
      };
    });
    get().calculateTotals();
  },

  togglePersonForItem: (itemIndex, personName) => {
    set((state) => {
      if (!state.currentInvoice) return state;

      const newItems = [...state.currentInvoice.items];
      const item = newItems[itemIndex];

      if (item.splitBetween.includes(personName)) {
        item.splitBetween = item.splitBetween.filter((p) => p !== personName);
      } else {
        item.splitBetween = [...item.splitBetween, personName];
      }

      return {
        currentInvoice: {
          ...state.currentInvoice,
          items: newItems,
        },
        hasUnsavedChanges: true,
      };
    });
    get().calculateTotals();
  },

  calculateTotals: () => {
    set((state) => {
      if (!state.currentInvoice) return state;

      // Create totals for ALL people, including those with no items assigned (they'll have $0)
      const newTotals: Person[] = state.people.map((person) => ({
        name: person,
        total: 0,
      }));

      let totalAmount = 0;

      state.currentInvoice.items.forEach((item) => {
        totalAmount += item.price;

        if (item.splitBetween.length > 0) {
          const splitAmount = item.price / item.splitBetween.length;
          item.splitBetween.forEach((person) => {
            const personTotal = newTotals.find((p) => p.name === person);
            if (personTotal) {
              personTotal.total += splitAmount;
            }
          });
        }
      });

      return {
        currentInvoice: {
          ...state.currentInvoice,
          people: state.people, // Ensure invoice's people array is synced
          totals: newTotals, // This includes everyone, even with $0
          totalAmount,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },

  clearInvoice: () => set({ currentInvoice: null, hasUnsavedChanges: false }),

  resetSession: () =>
    set({
      currentInvoice: null,
      people: [],
      editingSavedInvoice: false,
      hasUnsavedChanges: false,
    }),

  loadSavedInvoices: async () => {
    try {
      const json = await AsyncStorage.getItem(SAVED_INVOICES_KEY);
      const invoices: Invoice[] = json ? JSON.parse(json) : [];
      set({ savedInvoices: invoices });
    } catch (error) {
      console.error("Failed to load saved invoices:", error);
    }
  },

  saveCurrentInvoice: async () => {
    const state = get();
    if (!state.currentInvoice) {
      return null;
    }

    // Recalculate totals to ensure saved data is up to date
    state.calculateTotals();
    const { currentInvoice, savedInvoices } = get();
    if (!currentInvoice) {
      return null;
    }

    const now = new Date().toISOString();
    const invoiceId = currentInvoice.id || `invoice-${Date.now()}`;

    const invoiceToSave: Invoice = {
      ...currentInvoice,
      id: invoiceId,
      items: currentInvoice.items.map((item) => ({
        ...item,
        splitBetween: [...item.splitBetween],
      })),
      totals: currentInvoice.totals.map((person) => ({ ...person })),
      people: [...currentInvoice.people],
      updatedAt: now,
      savedAt: now,
    };

    const filtered = savedInvoices.filter(
      (invoice) => invoice.id !== invoiceId
    );
    const updatedInvoices = [invoiceToSave, ...filtered];

    try {
      await AsyncStorage.setItem(
        SAVED_INVOICES_KEY,
        JSON.stringify(updatedInvoices)
      );
      set({
        savedInvoices: updatedInvoices,
        currentInvoice: {
          ...currentInvoice,
          updatedAt: now,
        },
        hasUnsavedChanges: false,
      });
      return invoiceToSave;
    } catch (error) {
      console.error("Failed to save invoice:", error);
      throw error;
    }
  },

  deleteSavedInvoice: async (invoiceId) => {
    const { savedInvoices } = get();
    const updatedInvoices = savedInvoices.filter(
      (invoice) => invoice.id !== invoiceId
    );

    try {
      await AsyncStorage.setItem(
        SAVED_INVOICES_KEY,
        JSON.stringify(updatedInvoices)
      );
      set({ savedInvoices: updatedInvoices });
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      throw error;
    }
  },

  setEditingSavedInvoice: (value) => set({ editingSavedInvoice: value }),
  setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),
}));
