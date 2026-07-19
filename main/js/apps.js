/* ==========================================================================
   Ticket9jaPay — app.js
   Shared utilities used across all pages, plus landing page (index.html)
   logic. Include this file before payments.js / success.js on every page.
   ========================================================================== */

/* ---------------------------------------------------------------------
   Configuration
   Replace with the real deployed backend origin before going live.
   ------------------------------------------------------------------- */
const API_BASE = "https://ticket9ja-receipt-service.onrender.com/api";

/* ---------------------------------------------------------------------
   Generic API helpers
   ------------------------------------------------------------------- */

/**
 * Perform a GET request against the backend and return parsed JSON.
 * Throws a descriptive Error on network failure or non-2xx response.
 */
async function apiGet(path) {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });
  } catch (networkError) {
    throw new Error("NETWORK_ERROR");
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (parseError) {
    payload = null;
  }

  if (!response.ok) {
    const message = (payload && payload.message) || "SERVER_ERROR";
    throw new Error(message);
  }

  return payload;
}

/**
 * Perform a POST request with a JSON body and return parsed JSON.
 * Throws a descriptive Error on network failure or non-2xx response.
 */
async function apiPost(path, body) {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(body)
    });
  } catch (networkError) {
    throw new Error("NETWORK_ERROR");
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (parseError) {
    payload = null;
  }

  if (!response.ok) {
    const message = (payload && payload.message) || "SERVER_ERROR";
    throw new Error(message);
  }

  return payload;
}

/* ---------------------------------------------------------------------
   Formatting helpers
   ------------------------------------------------------------------- */

/** Format a numeric amount as Nigerian Naira, e.g. ₦5,000.00 */
function formatCurrency(amount) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2
  }).format(value);
}

/** Escape untrusted text before injecting into innerHTML. */
function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value == null ? "" : String(value);
  return div.innerHTML;
}

/**
 * Pull the first non-empty value out of an object, trying multiple
 * possible field names. Backend response shapes for some resources
 * (organizations, departments, sessions) aren't fully pinned down by
 * the API contract, so this keeps the UI resilient to minor naming
 * differences (e.g. "name" vs "title").
 */
function pickField(obj, keys, fallback) {
  if (!obj) return fallback;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      return obj[key];
    }
  }
  return fallback;
}

/** Normalize a list response that may be wrapped as {success, items} or a bare array. */
function normalizeList(payload, possibleKeys) {
  if (Array.isArray(payload)) return payload;
  if (!payload) return [];
  for (const key of possibleKeys) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  return [];
}

/* ---------------------------------------------------------------------
   Alert rendering
   ------------------------------------------------------------------- */

const ICONS = {
  error: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M10 6v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="10" cy="13.5" r="1" fill="currentColor"/></svg>`,
  info: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M10 9v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="10" cy="6.5" r="1" fill="currentColor"/></svg>`,
  success: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M6.5 10.2l2.3 2.3 4.7-4.9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
};

/**
 * Render an alert card (error | info | success) into a container element.
 * Pass retryFn to show a "Try again" action button.
 */
function showAlert(container, { title, message, type = "error", retryFn = null }) {
  if (!container) return;

  container.innerHTML = "";
  container.setAttribute("role", type === "error" ? "alert" : "status");

  const wrap = document.createElement("div");
  wrap.className = `alert alert-${type}`;

  const retryButton = retryFn
    ? `<div class="alert-action"><button type="button" class="btn btn-secondary" id="alertRetryBtn">Try again</button></div>`
    : "";

  wrap.innerHTML = `
    <span class="alert-icon">${ICONS[type] || ICONS.info}</span>
    <div>
      <div class="alert-title">${escapeHTML(title)}</div>
      <div class="alert-body">${escapeHTML(message)}</div>
      ${retryButton}
    </div>
  `;

  container.appendChild(wrap);

  if (retryFn) {
    const btn = wrap.querySelector("#alertRetryBtn");
    btn.addEventListener("click", retryFn);
  }
}

function clearAlert(container) {
  if (container) container.innerHTML = "";
}

/** Map a caught Error into a friendly title/message pair for showAlert(). */
function describeError(error) {
  const raw = error && error.message ? error.message : "";

  if (raw === "NETWORK_ERROR") {
    return {
      title: "Network error",
      message: "We couldn't reach Ticket9jaPay. Check your connection and try again."
    };
  }

  if (raw === "SERVER_ERROR" || raw === "") {
    return {
      title: "Something went wrong",
      message: "Our server ran into an issue. Please try again in a moment."
    };
  }

  return {
    title: "Payment initialization failed",
    message: raw
  };
}

/* =======================================================================
   LANDING PAGE (index.html) LOGIC
   Guarded so this file can be safely included on every page.
   ======================================================================= */

(function initLandingPage() {
  const paymentTypesGrid = document.getElementById("paymentTypesGrid");
  if (!paymentTypesGrid) return; // Not on the landing page.

  const orgSection = document.getElementById("orgSection");
  const orgGrid = document.getElementById("orgGrid");
  const paymentTypesSection = document.getElementById("paymentTypesSection");
  const emptyState = document.getElementById("emptyState");
  const landingAlert = document.getElementById("landingAlert");

  function setLoadingCards(container, count) {
    container.innerHTML = Array.from({ length: count })
      .map(() => `<div class="skeleton-card" aria-hidden="true"></div>`)
      .join("");
  }

  function paymentCardIcon() {
    return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="2.5" y="4.5" width="15" height="11" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M2.5 8h15" stroke="currentColor" stroke-width="1.5"/></svg>`;
  }

  function renderPaymentTypes(paymentTypes, organizationId) {
    if (!paymentTypes.length) {
      paymentTypesGrid.innerHTML = "";
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;

    paymentTypesGrid.innerHTML = paymentTypes
      .map((pt) => {
        const title = escapeHTML(pickField(pt, ["title", "name"], "Payment"));
        const description = pickField(pt, ["description", "summary"], "");
        const amount = pickField(pt, ["defaultAmount", "amount"], 0);
        const id = pickField(pt, ["id"], "");

        return `
          <article class="pay-card">
            <div class="pay-card-top">
              <span class="pay-card-icon">${paymentCardIcon()}</span>
            </div>
            <h3>${title}</h3>
            <p class="desc">${escapeHTML(description)}</p>
            <div class="amount-row">
              <span class="amount">${formatCurrency(amount)}</span>
              <button
                type="button"
                class="btn btn-primary"
                style="width:auto;"
                data-payment-type-id="${escapeHTML(id)}"
                aria-label="Pay now for ${title}"
              >Pay Now</button>
            </div>
          </article>
        `;
      })
      .join("");

    paymentTypesGrid.querySelectorAll("[data-payment-type-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const paymentTypeId = btn.getAttribute("data-payment-type-id");
        const params = new URLSearchParams({
          organizationId,
          paymentTypeId
        });
        window.location.href = `payments.html?${params.toString()}`;
      });
    });
  }

  async function loadPaymentTypes(organizationId) {
    setLoadingCards(paymentTypesGrid, 3);
    clearAlert(landingAlert);

    try {
      const data = await apiGet(
    `/public/organizations/${organizationId}/payment-types`
);
      const paymentTypes = normalizeList(data, ["paymentTypes"]);
      renderPaymentTypes(paymentTypes, organizationId);
    } catch (error) {
      paymentTypesGrid.innerHTML = "";
      const { title, message } = describeError(error);
      showAlert(landingAlert, {
        title,
        message,
        type: "error",
        retryFn: () => loadPaymentTypes(organizationId)
      });
    }
  }

  function renderOrganizations(organizations) {
    orgSection.hidden = false;
    orgGrid.innerHTML = organizations
      .map((org) => {
        const name = escapeHTML(pickField(org, ["name", "title"], "Institution"));
        const type = escapeHTML(pickField(org, ["type", "category"], "Institution"));
        const id = pickField(org, ["id"], "");

        return `
          <button type="button" class="org-card" data-org-id="${escapeHTML(id)}">
            <h3>${name}</h3>
            <p class="desc">${type}</p>
          </button>
        `;
      })
      .join("");

    orgGrid.querySelectorAll("[data-org-id]").forEach((card) => {
      card.addEventListener("click", () => {
        const organizationId = card.getAttribute("data-org-id");
        orgSection.hidden = true;
        paymentTypesSection.hidden = false;
        loadPaymentTypes(organizationId);
      });
    });
  }

  async function loadOrganizations() {
    setLoadingCards(paymentTypesGrid, 3);
    clearAlert(landingAlert);

    try {
      const data = await apiGet("/public/organizations");
      const organizations = normalizeList(data, ["organizations"]);

      if (!organizations.length) {
        paymentTypesGrid.innerHTML = "";
        emptyState.hidden = false;
        return;
      }

      if (organizations.length === 1) {
        // Single-tenant context: skip the picker and go straight to payment types.
        const organizationId = pickField(organizations[0], ["id"], "");
        paymentTypesSection.hidden = false;
        loadPaymentTypes(organizationId);
        return;
      }

      paymentTypesSection.hidden = true;
      renderOrganizations(organizations);
    } catch (error) {
      paymentTypesGrid.innerHTML = "";
      const { title, message } = describeError(error);
      showAlert(landingAlert, {
        title,
        message,
        type: "error",
        retryFn: loadOrganizations
      });
    }
  }

  loadOrganizations();
})();