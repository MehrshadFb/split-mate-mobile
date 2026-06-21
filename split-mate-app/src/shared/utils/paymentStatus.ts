import { Invoice } from "../types/invoice";

export const getOwedPeople = (invoice: Pick<Invoice, "totals">): string[] =>
  invoice.totals
    .filter((person) => person.total > 0)
    .map((person) => person.name);

export const getPaidPeople = (invoice: Pick<Invoice, "paidBy">): string[] =>
  invoice.paidBy ?? [];

export const isPersonPaid = (
  invoice: Pick<Invoice, "paidBy">,
  personName: string
): boolean => getPaidPeople(invoice).includes(personName);

export const getPaymentProgress = (
  invoice: Pick<Invoice, "paidBy" | "totals">
) => {
  const owedPeople = getOwedPeople(invoice);
  const paidPeople = getPaidPeople(invoice).filter((person) =>
    owedPeople.includes(person)
  );

  return {
    paidCount: paidPeople.length,
    owedCount: owedPeople.length,
    isPaid: owedPeople.length > 0 && paidPeople.length === owedPeople.length,
  };
};
