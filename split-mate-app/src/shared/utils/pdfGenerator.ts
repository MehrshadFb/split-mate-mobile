import { Invoice } from "../types/invoice";

export function generateReceiptHTML(invoice: Invoice): string {
  const { title, date, items, totals, totalAmount } = invoice;
  
  // Format date for display
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Generate items rows
  const itemsHTML = items
    .map(
      (item) => `
        <tr class="item-row">
          <td>
            <div class="item-name">
              ${escapeHtml(item.name)}
            </div>
            ${
              item.splitBetween.length > 0
                ? `<div class="item-split">
                    Split between: ${item.splitBetween.map(escapeHtml).join(", ")}
                   </div>`
                : ""
            }
          </td>
          <td class="item-price">
            $${item.price.toFixed(2)}
          </td>
        </tr>
      `
    )
    .join("");

  // Generate totals rows
  const totalsHTML = totals
    .map(
      (person) => `
        <tr class="split-row">
          <td class="person-name">
            ${escapeHtml(person.name)}
          </td>
          <td class="person-total">
            $${person.total.toFixed(2)}
          </td>
        </tr>
      `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title || "Receipt")}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1C1917;
      padding: 40px 24px;
      background: #FFFFFF;
    }
    .container {
      max-width: 650px;
      margin: 0 auto;
    }
    .header {
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 3px solid #D97757;
    }
    .title {
      font-size: 32px;
      font-weight: 700;
      color: #1C1917;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    .date {
      font-size: 14px;
      color: #57534E;
      font-weight: 500;
    }
    .section {
      margin-bottom: 32px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #1C1917;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #E7E5E4;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    .items-table tbody tr {
      border-bottom: 1px solid #F5F5F4;
    }
    .items-table tbody tr:last-of-type:not(.total-row) {
      border-bottom: none;
    }
    .items-table td:first-child {
      width: 70%;
      padding-right: 16px;
    }
    .items-table td:last-child {
      width: 30%;
      text-align: right;
      padding-left: 16px;
    }
    .item-row td {
      padding: 16px 0;
      vertical-align: middle;
    }
    .item-row:first-of-type td {
      padding-top: 4px;
    }
    .item-name {
      font-weight: 600;
      color: #1C1917;
      font-size: 15px;
      line-height: 1.4;
      margin-bottom: 6px;
    }
    .item-split {
      font-size: 13px;
      color: #78716C;
      line-height: 1.4;
    }
    .item-price {
      font-weight: 700;
      color: #1C1917;
      font-size: 15px;
      white-space: nowrap;
    }
    .total-row {
      background-color: #FFF4ED;
      border-top: 3px solid #D97757 !important;
      border-bottom: 3px solid #D97757 !important;
    }
    .total-row td {
      padding: 20px 16px !important;
      font-size: 18px;
      font-weight: 700;
      color: #1C1917;
      vertical-align: middle;
    }
    .total-row td:last-child {
      text-align: right;
    }
    .split-table tbody tr {
      border-bottom: 1px solid #F5F5F4;
    }
    .split-table tbody tr:last-child {
      border-bottom: none;
    }
    .split-table td:first-child {
      width: 60%;
      padding-right: 16px;
    }
    .split-table td:last-child {
      width: 40%;
      text-align: right;
      padding-left: 16px;
    }
    .split-row td {
      padding: 16px 0;
      vertical-align: middle;
    }
    .split-row:first-of-type td {
      padding-top: 4px;
    }
    .person-name {
      color: #1C1917;
      font-weight: 600;
      font-size: 15px;
      line-height: 1.4;
    }
    .person-total {
      font-weight: 700;
      color: #D97757;
      font-size: 15px;
      white-space: nowrap;
    }
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 2px solid #E7E5E4;
      text-align: center;
      color: #78716C;
      font-size: 12px;
    }
    .footer-brand {
      font-weight: 600;
      color: #D97757;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="title">${escapeHtml(title || "Receipt")}</div>
      <div class="date">${formattedDate}</div>
    </div>

    <!-- Items Section -->
    <div class="section">
      <div class="section-title">Items</div>
      <table class="items-table">
        <tbody>
          ${itemsHTML}
          <tr class="total-row">
            <td>Total Amount</td>
            <td style="text-align: right;">$${totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Split Summary Section -->
    ${
      totals.length > 0
        ? `
    <div class="section">
      <div class="section-title">Split Summary</div>
      <table class="split-table">
        <tbody>
          ${totalsHTML}
        </tbody>
      </table>
    </div>
    `
        : ""
    }

    <!-- Footer -->
    <div class="footer">
      Generated by <span class="footer-brand">SplitMate</span> • ${new Date().toLocaleDateString("en-US")}
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
