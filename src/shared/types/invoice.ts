// src/types/invoice.ts
// Domain types for invoice data model - matches web app structure

export interface Item {
  name: string;
  price: number;
  splitBetween: string[];
}

export interface Person {
  name: string;
  total: number;
}

export interface Invoice {
  id: string;
  title?: string;
  date: string;
  items: Item[];
  people: string[];
  totals: Person[];
  scanJobId?: string;
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
  savedAt?: string;
}

export interface ParsedReceiptData {
  items: Array<{
    name: string;
    price: number;
  }>;
}
