// src/stores/invoiceStore.ts
// Zustand store for invoice state management

import { create } from "zustand";
import { Invoice, Item, Person } from "../types/invoice";

interface InvoiceState {
  currentInvoice: Invoice | null;
  people: string[];

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
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  currentInvoice: null,
  people: [],

  setInvoice: (invoice) => set({ currentInvoice: invoice }),

  addPerson: (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    set((state) => ({
      people: [...state.people, trimmedName],
    }));
  },

  removePerson: (name) => {
    set((state) => ({
      people: state.people.filter((p) => p !== name),
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
      };
    });
    get().calculateTotals();
  },

  calculateTotals: () => {
    set((state) => {
      if (!state.currentInvoice) return state;

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
          totals: newTotals,
          totalAmount,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },

  clearInvoice: () => set({ currentInvoice: null }),
}));
