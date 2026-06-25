export interface Item {
  name: string;
  price: number;
  splitBetween: string[];
  shares?: Record<string, number>;
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
  paidBy: string[];
  scanJobId?: string;
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
  savedAt?: string;
}

export interface ParsedReceiptData {
  items: {
    name: string;
    price: number;
  }[];
}
