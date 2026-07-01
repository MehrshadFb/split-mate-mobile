import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { Invoice, Item, Person } from "../types/invoice";
import { getLocalDateString } from "../utils/dateUtils";
import { getOwedPeople } from "../utils/paymentStatus";
import { computeSplitAmounts, pruneShares } from "../utils/splitCalculations";

interface InvoiceState {
  currentInvoice: Invoice | null;
  people: string[];
  savedInvoices: Invoice[];
  editingSavedInvoice: boolean;
  setInvoice: (invoice: Invoice) => void;
  setInvoiceTitle: (title: string) => void;
  setInvoiceDate: (date: string) => void;
  addPerson: (name: string) => void;
  removePerson: (name: string) => void;
  setPeople: (people: string[]) => void;
  updateItem: (index: number, item: Partial<Item>) => void;
  addItem: (item: Item) => void;
  deleteItem: (index: number) => void;
  togglePersonForItem: (itemIndex: number, personName: string) => void;
  setItemShares: (
    itemIndex: number,
    shares: Record<string, number> | undefined
  ) => void;
  togglePersonPaid: (personName: string) => void;
  calculateTotals: () => void;
  clearInvoice: () => void;
  resetSession: () => void;
  loadSavedInvoices: () => Promise<void>;
  deleteSavedInvoice: (invoiceId: string) => Promise<void>;
  setEditingSavedInvoice: (value: boolean) => void;
  flushPendingSave: () => Promise<void>;
}

const SAVED_INVOICES_KEY = "@splitmate:saved_invoices";
const AUTO_SAVE_DEBOUNCE_MS = 120;

export const useInvoiceStore = create<InvoiceState>((set, get) => {
  // Encapsulated auto-save state — never escapes the store factory.
  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingPayload: { invoice: Invoice; people: string[] } | null = null;

  const persistInvoice = async (invoice: Invoice, peopleList: string[]) => {
    if (invoice.items.length === 0) return;
    const now = new Date().toISOString();
    const invoiceId = invoice.id || `invoice-${Date.now()}`;
    const invoiceToSave: Invoice = {
      ...invoice,
      id: invoiceId,
      date: invoice.date || getLocalDateString(),
      items: invoice.items.map((item) => ({
        ...item,
        splitBetween: [...item.splitBetween],
        shares: item.shares ? { ...item.shares } : undefined,
      })),
      totals: invoice.totals.map((p) => ({ ...p })),
      people: [...peopleList],
      paidBy: [...(invoice.paidBy ?? [])],
      updatedAt: now,
      savedAt: invoice.savedAt ?? now,
    };
    const { savedInvoices } = get();
    const filtered = savedInvoices.filter((i) => i.id !== invoiceId);
    const updatedInvoices = [invoiceToSave, ...filtered];
    try {
      await AsyncStorage.setItem(
        SAVED_INVOICES_KEY,
        JSON.stringify(updatedInvoices)
      );
      set({ savedInvoices: updatedInvoices });
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  };

  const scheduleAutoSave = () => {
    const state = get();
    if (!state.currentInvoice) return;
    pendingPayload = { invoice: state.currentInvoice, people: state.people };
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      autoSaveTimer = null;
      const payload = pendingPayload;
      pendingPayload = null;
      if (payload) void persistInvoice(payload.invoice, payload.people);
    }, AUTO_SAVE_DEBOUNCE_MS);
  };

  const flushPendingSave = async (): Promise<void> => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = null;
    }
    const payload = pendingPayload;
    pendingPayload = null;
    if (payload) {
      await persistInvoice(payload.invoice, payload.people);
    }
  };

  // HOC: wraps a mutating action so it always schedules an auto-save.
  // Adding a new mutating action? Wrap it in withAutoSave — impossible to forget.
  const withAutoSave = <A extends unknown[]>(action: (...args: A) => void) =>
    (...args: A): void => {
      action(...args);
      scheduleAutoSave();
    };

  return {
    currentInvoice: null,
    people: [],
    savedInvoices: [],
    editingSavedInvoice: false,

    setInvoice: (invoice) =>
      set({ currentInvoice: { ...invoice, paidBy: invoice.paidBy ?? [] } }),

    setInvoiceTitle: withAutoSave((title: string) => {
      set((state) => {
        if (!state.currentInvoice) return state;
        return {
          currentInvoice: {
            ...state.currentInvoice,
            title,
            updatedAt: new Date().toISOString(),
          },
        };
      });
    }),

    setInvoiceDate: withAutoSave((date: string) => {
      set((state) => {
        if (!state.currentInvoice) return state;
        return {
          currentInvoice: {
            ...state.currentInvoice,
            date,
            updatedAt: new Date().toISOString(),
          },
        };
      });
    }),

    addPerson: withAutoSave((name: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) return;
      set((state) => ({ people: [...state.people, trimmedName] }));
    }),

    removePerson: withAutoSave((name: string) => {
      set((state) => ({ people: state.people.filter((p) => p !== name) }));
    }),

    setPeople: (people) => set({ people }),

    updateItem: withAutoSave((index: number, itemUpdate: Partial<Item>) => {
      set((state) => {
        if (!state.currentInvoice) return state;
        const newItems = [...state.currentInvoice.items];
        const existing = newItems[index];
        if (!existing) return state;
        const merged: Item = { ...existing, ...itemUpdate };
        const priceChanged =
          typeof itemUpdate.price === "number" &&
          itemUpdate.price !== existing.price;
        if (priceChanged) merged.shares = undefined;
        newItems[index] = merged;
        return {
          currentInvoice: { ...state.currentInvoice, items: newItems },
        };
      });
      get().calculateTotals();
    }),

    addItem: withAutoSave((item: Item) => {
      set((state) => {
        if (!state.currentInvoice) {
          const now = new Date();
          const newInvoice: Invoice = {
            id: `invoice-${Date.now()}`,
            date: getLocalDateString(),
            items: [item],
            people: state.people,
            totals: [],
            paidBy: [],
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
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
    }),

    deleteItem: withAutoSave((index: number) => {
      set((state) => {
        if (!state.currentInvoice) return state;
        const newItems = state.currentInvoice.items.filter(
          (_, i) => i !== index
        );
        return {
          currentInvoice: { ...state.currentInvoice, items: newItems },
        };
      });
      get().calculateTotals();
    }),

    togglePersonForItem: withAutoSave(
      (itemIndex: number, personName: string) => {
        set((state) => {
          if (!state.currentInvoice) return state;
          const newItems = [...state.currentInvoice.items];
          const existing = newItems[itemIndex];
          if (!existing) return state;
          const isAssigned = existing.splitBetween.includes(personName);
          const nextSplitBetween = isAssigned
            ? existing.splitBetween.filter((p) => p !== personName)
            : [...existing.splitBetween, personName];
          const nextShares = isAssigned
            ? pruneShares(existing.shares, nextSplitBetween)
            : existing.shares;
          newItems[itemIndex] = {
            ...existing,
            splitBetween: nextSplitBetween,
            shares: nextShares,
          };
          return {
            currentInvoice: { ...state.currentInvoice, items: newItems },
          };
        });
        get().calculateTotals();
      }
    ),

    setItemShares: withAutoSave(
      (itemIndex: number, shares: Record<string, number> | undefined) => {
        set((state) => {
          if (!state.currentInvoice) return state;
          const newItems = [...state.currentInvoice.items];
          const existing = newItems[itemIndex];
          if (!existing) return state;
          newItems[itemIndex] = { ...existing, shares };
          return {
            currentInvoice: { ...state.currentInvoice, items: newItems },
          };
        });
        get().calculateTotals();
      }
    ),

    togglePersonPaid: withAutoSave((personName: string) => {
      set((state) => {
        if (!state.currentInvoice) return state;
        const personTotal = state.currentInvoice.totals.find(
          (p) => p.name === personName
        );
        if (!personTotal || personTotal.total <= 0) return state;
        const paidBy = state.currentInvoice.paidBy ?? [];
        const nextPaidBy = paidBy.includes(personName)
          ? paidBy.filter((p) => p !== personName)
          : [...paidBy, personName];
        return {
          currentInvoice: {
            ...state.currentInvoice,
            paidBy: nextPaidBy,
            updatedAt: new Date().toISOString(),
          },
        };
      });
    }),

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
          if (item.splitBetween.length === 0) return;
          const amounts = computeSplitAmounts(
            item.price,
            item.splitBetween,
            item.shares
          );
          item.splitBetween.forEach((person, i) => {
            const personTotal = newTotals.find((p) => p.name === person);
            if (personTotal) {
              personTotal.total += amounts[i];
            }
          });
        });
        const owedPeople = getOwedPeople({ totals: newTotals });
        return {
          currentInvoice: {
            ...state.currentInvoice,
            people: state.people,
            totals: newTotals,
            paidBy: (state.currentInvoice.paidBy ?? []).filter((person) =>
              owedPeople.includes(person)
            ),
            totalAmount,
            updatedAt: new Date().toISOString(),
          },
        };
      });
    },

    clearInvoice: () => {
      void flushPendingSave();
      set({ currentInvoice: null });
    },

    resetSession: () => {
      void flushPendingSave();
      set({
        currentInvoice: null,
        people: [],
        editingSavedInvoice: false,
      });
    },

    loadSavedInvoices: async () => {
      try {
        const json = await AsyncStorage.getItem(SAVED_INVOICES_KEY);
        const parsedInvoices: Invoice[] = json ? JSON.parse(json) : [];
        const invoices = parsedInvoices.map((invoice) => ({
          ...invoice,
          paidBy: invoice.paidBy ?? [],
        }));
        set({ savedInvoices: invoices });
      } catch (error) {
        console.error("Failed to load saved invoices:", error);
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

    flushPendingSave,
  };
});
