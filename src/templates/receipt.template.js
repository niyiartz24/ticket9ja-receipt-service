const { generateQRCode } = require("../utils/qrcode.util");

const formatCurrency = (amount, currency = "NGN") => {
    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: currency || "NGN",
            currencyDisplay: "symbol"
        }).format(amount || 0);
    } catch (err) {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN"
        }).format(amount || 0);
    }
};

const formatDate = (date) => {
    return new Date(date).toLocaleString("en-NG", {
        dateStyle: "long",
        timeStyle: "short"
    });
};

const escapeHtml = (value) => {
    if (value === null || value === undefined) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
};

const initials = (name) => {
    if (!name) return "T9";
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "T9";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const statusMeta = (rawStatus) => {
    const status = String(rawStatus || "").toLowerCase();
    if (status === "success" || status === "successful" || status === "paid" || status === "completed") {
        return { label: "Payment Successful", bg: "#ECFDF5", fg: "#16A34A", border: "#BBF7D0", dot: "#16A34A" };
    }
    if (status === "pending" || status === "processing") {
        return { label: "Payment Pending", bg: "#FFFBEB", fg: "#B45309", border: "#FDE68A", dot: "#D97706" };
    }
    if (status === "failed" || status === "declined" || status === "cancelled") {
        return { label: "Payment Failed", bg: "#FEF2F2", fg: "#B91C1C", border: "#FECACA", dot: "#DC2626" };
    }
    return { label: rawStatus ? String(rawStatus) : "Payment Recorded", bg: "#F1F5F9", fg: "#334155", border: "#E2E8F0", dot: "#64748B" };
};

module.exports = async (receipt) => {

    const qrCode = await generateQRCode(receipt.receiptId);

    const org = receipt.organization || {};
    const template = org.receiptTemplate || {};

    const primaryColor = template.primaryColor || org.primaryColor || "#0F172A";
    const watermarkText = template.watermark || "";
    const footerText = template.footerText || "";

    const orgName = escapeHtml(org.name || "Institution");
    const orgLogo = org.logo || "";
    const orgEmail = escapeHtml(org.email || "");
    const orgPhone = escapeHtml(org.phone || "");
    const orgAddress = escapeHtml(org.address || "");
    const departmentName = receipt.department && receipt.department.name ? escapeHtml(receipt.department.name) : "";

    const status = statusMeta(receipt.paymentStatus);

    const paymentTypeTitle = escapeHtml(receipt.paymentType && receipt.paymentType.title ? receipt.paymentType.title : "Payment");
    const paymentTypeDescription = receipt.paymentType && receipt.paymentType.description ? escapeHtml(receipt.paymentType.description) : "";
    const sessionName = receipt.session && receipt.session.name ? escapeHtml(receipt.session.name) : "N/A";

    const description = receipt.description ? escapeHtml(receipt.description) : (paymentTypeDescription || "N/A");

    // Derive a soft tint of the primary color for accents/backgrounds
    const hexToRgb = (hex) => {
        const clean = String(hex || "#0F172A").replace("#", "");
        const full = clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean;
        const num = parseInt(full, 16);
        if (Number.isNaN(num)) return { r: 15, g: 23, b: 42 };
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    };
    const { r, g, b } = hexToRgb(primaryColor);
    const primaryTint = `rgba(${r}, ${g}, ${b}, 0.06)`;
    const primaryBorder = `rgba(${r}, ${g}, ${b}, 0.18)`;
    const primaryTintStrong = `rgba(${r}, ${g}, ${b}, 0.12)`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Receipt ${escapeHtml(receipt.receiptId)} — ${orgName}</title>
<style>

  @page {
    size: A4;
    margin: 0;
  }

  :root {
    --primary: ${primaryColor};
    --primary-tint: ${primaryTint};
    --primary-tint-strong: ${primaryTintStrong};
    --primary-border: ${primaryBorder};
    --bg: #F8FAFC;
    --card: #FFFFFF;
    --border: #E5E7EB;
    --text: #1E293B;
    --muted: #64748B;
    --success: #16A34A;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    background: var(--bg);
    color: var(--text);
    font-family: "Inter", "Segoe UI", Roboto, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  body {
    padding: 32px;
    display: flex;
    justify-content: center;
  }

  .sheet {
    position: relative;
    width: 100%;
    max-width: 780px;
    background: var(--card);
    border-radius: 24px;
    border: 1px solid var(--border);
    box-shadow: 0 20px 50px -12px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.06);
    overflow: hidden;
  }

  /* ---------- Watermark ---------- */

  .watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-32deg);
    font-size: 84px;
    font-weight: 800;
    letter-spacing: 4px;
    color: var(--primary);
    opacity: 0.04;
    white-space: nowrap;
    pointer-events: none;
    z-index: 0;
    text-transform: uppercase;
  }

  /* ---------- Header ---------- */

  .header {
    position: relative;
    z-index: 1;
    padding: 40px 44px 32px;
    background: linear-gradient(180deg, var(--primary-tint) 0%, rgba(255,255,255,0) 100%);
    border-bottom: 1px solid var(--border);
  }

  .header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 28px;
  }

  .org-identity {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .org-logo {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    object-fit: cover;
    border: 1px solid var(--border);
    background: #fff;
  }

  .org-logo-fallback {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: var(--primary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 18px;
    letter-spacing: 0.5px;
  }

  .org-text .org-name {
    font-size: 19px;
    font-weight: 700;
    color: var(--text);
    line-height: 1.25;
  }

  .org-text .org-dept {
    font-size: 13px;
    color: var(--muted);
    margin-top: 2px;
    font-weight: 500;
  }

  .receipt-tag {
    text-align: right;
  }

  .receipt-tag .eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: var(--muted);
  }

  .receipt-tag .rid {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    margin-top: 3px;
    font-variant-numeric: tabular-nums;
  }

  .header-main {
    text-align: center;
  }

  .header-main h1 {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text);
    margin-bottom: 6px;
  }

  .header-main p {
    font-size: 13.5px;
    color: var(--muted);
    font-weight: 500;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 20px;
    padding: 9px 20px;
    border-radius: 999px;
    font-size: 13.5px;
    font-weight: 600;
    background: ${status.bg};
    color: ${status.fg};
    border: 1px solid ${status.border};
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${status.dot};
    flex-shrink: 0;
  }

  /* ---------- Body ---------- */

  .body {
    position: relative;
    z-index: 1;
    padding: 32px 44px 12px;
  }

  .section-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.1px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 14px;
  }

  .grid-two {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 24px;
  }

  .info-card {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 22px 22px;
  }

  .info-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 9px 0;
  }

  .info-row + .info-row {
    border-top: 1px solid var(--border);
  }

  .info-label {
    font-size: 13px;
    color: var(--muted);
    font-weight: 500;
    flex-shrink: 0;
  }

  .info-value {
    font-size: 13.5px;
    color: var(--text);
    font-weight: 600;
    text-align: right;
    word-break: break-word;
  }

  .mono {
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.2px;
  }

  /* ---------- Payment Summary ---------- */

  .summary-card {
    background: var(--text);
    background: linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 78%, black) 100%);
    border-radius: 18px;
    padding: 30px 32px;
    margin-bottom: 24px;
    color: #fff;
    position: relative;
    overflow: hidden;
  }

  .summary-rows {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px 24px;
    margin-bottom: 22px;
  }

  .summary-item .summary-label {
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.65);
    margin-bottom: 5px;
  }

  .summary-item .summary-value {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
  }

  .total-divider {
    height: 1px;
    background: rgba(255,255,255,0.18);
    margin: 22px 0 20px;
  }

  .total-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  .total-label {
    font-size: 12.5px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.7);
  }

  .total-amount {
    font-size: 38px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  /* ---------- Verification ---------- */

  .verify-card {
    display: flex;
    align-items: center;
    gap: 24px;
    background: var(--bg);
    border: 1px dashed var(--border);
    border-radius: 16px;
    padding: 24px 26px;
    margin-bottom: 8px;
  }

  .verify-qr {
    flex-shrink: 0;
    width: 96px;
    height: 96px;
    padding: 6px;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 12px;
  }

  .verify-qr img {
    width: 100%;
    height: 100%;
    display: block;
  }

  .verify-text .verify-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 6px;
  }

  .verify-text .verify-ids {
    font-size: 12.5px;
    color: var(--muted);
    margin-bottom: 8px;
    line-height: 1.6;
  }

  .verify-text .verify-note {
    font-size: 12px;
    color: var(--muted);
    font-style: italic;
  }

  /* ---------- Footer ---------- */

  .footer {
    position: relative;
    z-index: 1;
    padding: 26px 44px 34px;
    border-top: 1px solid var(--border);
    margin-top: 16px;
  }

  .footer-org {
    text-align: center;
    font-size: 12px;
    color: var(--muted);
    line-height: 1.7;
    margin-bottom: 14px;
  }

  .footer-org strong {
    color: var(--text);
    font-weight: 600;
  }

  .footer-custom {
    text-align: center;
    font-size: 12px;
    color: var(--muted);
    margin-bottom: 14px;
    line-height: 1.6;
  }

  .footer-meta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 11px;
    color: #94A3B8;
    text-align: center;
  }

  .footer-meta .divider {
    color: var(--border);
  }

  .footer-brand {
    font-weight: 600;
    color: var(--muted);
  }

  /* ---------- Print ---------- */

  @media print {
    html, body {
      background: #fff !important;
      padding: 0 !important;
    }

    .sheet {
      box-shadow: none !important;
      border: none !important;
      border-radius: 0 !important;
      max-width: 100% !important;
    }

    .info-card {
      background: #fff !important;
    }

    .verify-card {
      background: #fff !important;
    }

    .summary-card {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }

    .status-badge {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }
  }

</style>
</head>
<body>

  <div class="sheet">

    ${watermarkText ? `<div class="watermark">${escapeHtml(watermarkText)}</div>` : ""}

    <!-- Header -->
    <div class="header">
      <div class="header-top">
        <div class="org-identity">
          ${orgLogo
            ? `<img class="org-logo" src="${orgLogo}" alt="${orgName}" />`
            : `<div class="org-logo-fallback">${escapeHtml(initials(org.name))}</div>`
          }
          <div class="org-text">
            <div class="org-name">${orgName}</div>
            ${departmentName ? `<div class="org-dept">${departmentName}</div>` : ""}
          </div>
        </div>
        <div class="receipt-tag">
          <div class="eyebrow">Receipt No.</div>
          <div class="rid mono">${escapeHtml(receipt.receiptId)}</div>
        </div>
      </div>

      <div class="header-main">
        <h1>Official Payment Receipt</h1>
        <p>This document certifies that the payment described below has been recorded.</p>
        <div class="status-badge">
          <span class="status-dot"></span>
          ${escapeHtml(status.label)}
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="body">

      <div class="grid-two">
        <div class="info-card">
          <div class="section-title">Receipt Details</div>
          <div class="info-row">
            <span class="info-label">Receipt ID</span>
            <span class="info-value mono">${escapeHtml(receipt.receiptId)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Reference</span>
            <span class="info-value mono">${escapeHtml(receipt.reference)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status</span>
            <span class="info-value">${escapeHtml(status.label)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Date</span>
            <span class="info-value">${formatDate(receipt.paymentDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Method</span>
            <span class="info-value">${escapeHtml(receipt.paymentMethod || "N/A")}</span>
          </div>
        </div>

        <div class="info-card">
          <div class="section-title">Student Information</div>
          <div class="info-row">
            <span class="info-label">Name</span>
            <span class="info-value">${escapeHtml(receipt.payerName || "N/A")}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email</span>
            <span class="info-value">${escapeHtml(receipt.email || "N/A")}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone</span>
            <span class="info-value">${escapeHtml(receipt.phone || "N/A")}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Matric Number</span>
            <span class="info-value mono">${escapeHtml(receipt.matricNumber || "N/A")}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Level</span>
            <span class="info-value">${escapeHtml(receipt.level || "N/A")}</span>
          </div>
        </div>
      </div>

      <!-- Payment Summary -->
      <div class="summary-card">
        <div class="summary-rows">
          <div class="summary-item">
            <div class="summary-label">Payment Type</div>
            <div class="summary-value">${paymentTypeTitle}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Academic Session</div>
            <div class="summary-value">${sessionName}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Description</div>
            <div class="summary-value">${description}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Currency</div>
            <div class="summary-value">${escapeHtml(receipt.currency || "NGN")}</div>
          </div>
        </div>

        <div class="total-divider"></div>

        <div class="total-row">
          <div class="total-label">Total Paid</div>
          <div class="total-amount mono">${formatCurrency(receipt.amount, receipt.currency)}</div>
        </div>
      </div>

      <!-- Verification -->
      <div class="verify-card">
        <div class="verify-qr">
          <img src="${qrCode}" alt="Verification QR Code" />
        </div>
        <div class="verify-text">
          <div class="verify-title">Verify this Receipt</div>
          <div class="verify-ids">
            Receipt ID: <strong class="mono">${escapeHtml(receipt.receiptId)}</strong><br />
            Reference: <strong class="mono">${escapeHtml(receipt.reference)}</strong>
          </div>
          <div class="verify-note">Scan this QR Code to verify the authenticity of this receipt.</div>
        </div>
      </div>

    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-org">
        ${orgAddress ? `<strong>${orgName}</strong> &middot; ${orgAddress}<br />` : `<strong>${orgName}</strong><br />`}
        ${[orgEmail, orgPhone].filter(Boolean).join(" &middot; ")}
      </div>

      ${footerText ? `<div class="footer-custom">${escapeHtml(footerText)}</div>` : ""}

      <div class="footer-meta">
        <span>This is a computer-generated receipt and requires no signature.</span>
        <span class="divider">|</span>
        <span class="footer-brand">Powered by Ticket9ja</span>
      </div>
    </div>

  </div>

</body>
</html>
    `;

};