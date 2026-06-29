import { Invoice } from "../types/invoice";
import { computeSplitAmounts, isCustomSplit } from "./splitCalculations";

export function generateReceiptHTML(invoice: Invoice): string {
  const { title, date, items, totalAmount, people, paidBy } = invoice;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const paid = new Set(paidBy ?? []);

  const breakdowns = people
    .map((person) => {
      const itemsForPerson: { name: string; amount: number }[] = [];
      let total = 0;
      items.forEach((item) => {
        const idx = item.splitBetween.indexOf(person);
        if (idx === -1) return;
        const amounts = computeSplitAmounts(
          item.price,
          item.splitBetween,
          item.shares
        );
        const amount = amounts[idx];
        itemsForPerson.push({ name: item.name, amount });
        total += amount;
      });
      return { name: person, items: itemsForPerson, total };
    })
    .filter((b) => b.items.length > 0);

  const pendingCount = breakdowns.filter((b) => !paid.has(b.name)).length;
  const statusLine =
    breakdowns.length === 0
      ? `${items.length} item${items.length === 1 ? "" : "s"}`
      : pendingCount === 0
        ? `${breakdowns.length} ${breakdowns.length === 1 ? "person" : "people"} • all settled`
        : `${pendingCount} of ${breakdowns.length} still to settle`;

  const ticketsHTML = breakdowns
    .map((b) => {
      const isPaid = paid.has(b.name);
      return `
        <div class="ticket ${isPaid ? "ticket--paid" : ""}">
          <div class="ticket-bar">
            <div class="ticket-bar-left">
              <span class="ticket-name">${escapeHtml(b.name)}</span>
              ${isPaid ? '<span class="ticket-stamp">Paid</span>' : ""}
            </div>
            <span class="ticket-amount">$${b.total.toFixed(2)}</span>
          </div>
          <div class="ticket-body">
            ${b.items
              .map(
                (i) => `
              <div class="ticket-row">
                <span class="ticket-row-name">${escapeHtml(i.name)}</span>
                <span class="ticket-dots"></span>
                <span class="ticket-row-amount">$${i.amount.toFixed(2)}</span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `;
    })
    .join("");

  const billHTML = items
    .map((item) => {
      const isUneven = isCustomSplit(item.splitBetween, item.shares);
      let splitLine = "";
      if (item.splitBetween.length > 0) {
        const perPerson = isUneven
          ? computeSplitAmounts(item.price, item.splitBetween, item.shares)
          : null;
        const parts = item.splitBetween.map((person, i) =>
          perPerson
            ? `${escapeHtml(person)} ($${perPerson[i].toFixed(2)})`
            : escapeHtml(person)
        );
        splitLine = `<div class="bill-split">Split between: ${parts.join(", ")}</div>`;
      }
      const badge = isUneven
        ? `<span class="custom-badge">Custom portions</span>`
        : "";
      return `
        <div class="bill-row">
          <div class="bill-row-main">
            <div class="bill-name">${escapeHtml(item.name)}${badge}</div>
            ${splitLine}
          </div>
          <div class="bill-price">$${item.price.toFixed(2)}</div>
        </div>
      `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title || "Receipt")}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.5;
      color: #1C1917;
      padding: 36px 24px 48px;
      background: #FFFFFF;
    }
    .container { max-width: 680px; margin: 0 auto; }

    /* HERO */
    .hero {
      position: relative;
      background: #FFF4ED;
      border-radius: 20px;
      padding: 32px 32px 28px;
      margin-bottom: 40px;
      overflow: hidden;
    }
    .hero::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 6px;
      background: #D97757;
    }
    .hero-eyebrow {
      font-size: 11px;
      letter-spacing: 1.4px;
      text-transform: uppercase;
      font-weight: 700;
      color: #D97757;
      margin-bottom: 12px;
    }
    .hero-title {
      font-size: 30px;
      font-weight: 800;
      color: #1C1917;
      letter-spacing: -0.6px;
      line-height: 1.15;
      margin-bottom: 6px;
    }
    .hero-date {
      font-size: 13px;
      color: #78716C;
      font-weight: 500;
      margin-bottom: 24px;
    }
    .hero-total-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 16px;
      padding-top: 18px;
      border-top: 1px dashed #D97757;
    }
    .hero-total-label {
      font-size: 12px;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      font-weight: 700;
      color: #78716C;
      margin-bottom: 4px;
    }
    .hero-total-value {
      font-size: 42px;
      font-weight: 800;
      color: #1C1917;
      letter-spacing: -1px;
      line-height: 1;
    }
    .hero-status {
      font-size: 12px;
      color: #57534E;
      font-weight: 600;
      text-align: right;
      max-width: 50%;
    }

    /* SECTIONS */
    .section { margin-bottom: 36px; }
    .section:last-of-type { margin-bottom: 0; }
    .section-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 18px;
    }
    .section-title {
      font-size: 11px;
      letter-spacing: 1.6px;
      text-transform: uppercase;
      font-weight: 800;
      color: #1C1917;
    }
    .section-hint {
      font-size: 11px;
      letter-spacing: 0.6px;
      color: #A8A29E;
      font-weight: 500;
    }

    /* TICKETS */
    .ticket {
      border: 1px solid #E7E5E4;
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: 14px;
      background: #FFFFFF;
      page-break-inside: avoid;
    }
    .ticket:last-child { margin-bottom: 0; }
    .ticket-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      background: #D97757;
      color: #FFFFFF;
    }
    .ticket-bar-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .ticket-name {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.2px;
    }
    .ticket-amount {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.3px;
    }
    .ticket-stamp {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      background: rgba(255,255,255,0.22);
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .ticket-body {
      padding: 14px 20px 16px;
    }
    .ticket-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
      padding: 5px 0;
      font-size: 14px;
    }
    .ticket-row-name {
      color: #57534E;
      flex-shrink: 1;
    }
    .ticket-dots {
      flex: 1;
      border-bottom: 1px dotted #D6D3D1;
      transform: translateY(-3px);
    }
    .ticket-row-amount {
      color: #1C1917;
      font-weight: 700;
      white-space: nowrap;
    }
    .ticket--paid .ticket-bar { background: #A8A29E; }
    .ticket--paid .ticket-amount { text-decoration: line-through; opacity: 0.85; }
    .ticket--paid .ticket-body { opacity: 0.55; }
    .ticket--paid .ticket-row-amount { text-decoration: line-through; }

    /* BILL */
    .bill {
      border: 1px solid #E7E5E4;
      border-radius: 14px;
      overflow: hidden;
    }
    .bill-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 20px;
      border-bottom: 1px dashed #E7E5E4;
    }
    .bill-row:last-of-type { border-bottom: none; }
    .bill-row-main { flex: 1; min-width: 0; }
    .bill-name {
      font-size: 14px;
      font-weight: 700;
      color: #1C1917;
      margin-bottom: 4px;
    }
    .bill-split {
      font-size: 12px;
      color: #78716C;
      line-height: 1.45;
    }
    .bill-price {
      font-size: 14px;
      font-weight: 700;
      color: #1C1917;
      white-space: nowrap;
    }
    .bill-total {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: #FFF4ED;
      border-top: 2px solid #D97757;
    }
    .bill-total-label {
      font-size: 12px;
      letter-spacing: 1.4px;
      text-transform: uppercase;
      font-weight: 800;
      color: #D97757;
    }
    .bill-total-value {
      font-size: 20px;
      font-weight: 800;
      color: #1C1917;
      letter-spacing: -0.4px;
    }
    .custom-badge {
      display: inline-block;
      margin-left: 8px;
      padding: 2px 8px;
      border-radius: 999px;
      background-color: #FFF4ED;
      color: #D97757;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      vertical-align: middle;
    }

    /* FOOTER */
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #A8A29E;
      font-size: 11px;
      letter-spacing: 0.4px;
    }
    .footer-brand {
      font-weight: 700;
      color: #D97757;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="container">

    <div class="hero">
      <div class="hero-eyebrow">Settle Up</div>
      <div class="hero-title">${escapeHtml(title || "Receipt")}</div>
      <div class="hero-date">${formattedDate}</div>
      <div class="hero-total-row">
        <div>
          <div class="hero-total-label">Total</div>
          <div class="hero-total-value">$${totalAmount.toFixed(2)}</div>
        </div>
        <div class="hero-status">${statusLine}</div>
      </div>
    </div>

    ${
      breakdowns.length > 0
        ? `
    <div class="section">
      <div class="section-header">
        <div class="section-title">Who owes what</div>
        <div class="section-hint">${breakdowns.length} ${breakdowns.length === 1 ? "person" : "people"}</div>
      </div>
      ${ticketsHTML}
    </div>
    `
        : ""
    }

    <div class="section">
      <div class="section-header">
        <div class="section-title">The full bill</div>
        <div class="section-hint">${items.length} item${items.length === 1 ? "" : "s"}</div>
      </div>
      <div class="bill">
        ${billHTML}
        <div class="bill-total">
          <span class="bill-total-label">Total</span>
          <span class="bill-total-value">$${totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      Generated by <span class="footer-brand">SplitMate</span>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
