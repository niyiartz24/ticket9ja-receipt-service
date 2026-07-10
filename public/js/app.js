/* =========================================================
   Ticket9ja — Receipt Portal
   Vanilla JS application logic
   No frameworks. No build step.
========================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------
     Config
  --------------------------------------------------------- */
  const API_BASE =
    window.location.hostname === "localhost"
        ? "http://localhost:5000/api/receipts"
        : "https://ticket9ja-receipt-service.onrender.com/api/receipts";

  /* ---------------------------------------------------------
     Element references
  --------------------------------------------------------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var tabsIndicator = document.querySelector(".tabs__indicator");
  var fields = {
    email: document.getElementById("panel-email"),
    receiptId: document.getElementById("panel-receiptId"),
    reference: document.getElementById("panel-reference")
  };
  var inputs = {
    email: document.getElementById("input-email"),
    receiptId: document.getElementById("input-receiptId"),
    reference: document.getElementById("input-reference")
  };

  var form = document.getElementById("search-form");
  var fieldError = document.getElementById("field-error");
  var btnSearch = document.getElementById("btn-search");
  var btnSearchLabel = document.getElementById("btn-search-label");
  var btnSpinner = document.getElementById("btn-spinner");
  var resultsEl = document.getElementById("results");

  var toast = document.getElementById("toast");
  var toastIcon = document.getElementById("toast-icon");
  var toastMessage = document.getElementById("toast-message");
  var toastTimer = null;

  var activeMethod = "email";

  /* ---------------------------------------------------------
     Icons (inline SVG strings, reused across states)
  --------------------------------------------------------- */
  var ICON_EMPTY =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/>' +
    '<path d="M20 20L16.5 16.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
    '<path d="M8.5 11h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
    "</svg>";

  var ICON_ERROR =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M12 9v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
    '<path d="M12 16.5h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
    '<path d="M10.3 3.9L2.6 17.5a1.6 1.6 0 0 0 1.4 2.4h16a1.6 1.6 0 0 0 1.4-2.4L13.7 3.9a1.6 1.6 0 0 0-2.8 0z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
    "</svg>";

  var ICON_TOAST_SUCCESS =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/>' +
    '<path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
    "</svg>";

  var ICON_TOAST_ERROR =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/>' +
    '<path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
    "</svg>";

  /* ---------------------------------------------------------
     Tab switching
  --------------------------------------------------------- */
  function setActiveTab(method) {
    activeMethod = method;

    tabs.forEach(function (tab) {
      var isActive = tab.dataset.method === method;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    Object.keys(fields).forEach(function (key) {
      var isVisible = key === method;
      fields[key].hidden = !isVisible;
      fields[key].classList.toggle("is-hidden", !isVisible);
    });

    hideFieldError();

    // Move focus to the visible input for keyboard users
    var input = inputs[method];
    if (input) {
      window.requestAnimationFrame(function () {
        input.focus({ preventScroll: true });
      });
    }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      setActiveTab(tab.dataset.method);
    });
  });

  /* ---------------------------------------------------------
     Field validation helpers
  --------------------------------------------------------- */
  function showFieldError(message) {
    fieldError.textContent = message;
    fieldError.hidden = false;
  }

  function hideFieldError() {
    fieldError.hidden = true;
    fieldError.textContent = "";
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  /* ---------------------------------------------------------
     Loading state on the search button
  --------------------------------------------------------- */
  function setSearching(isSearching) {
    btnSearch.disabled = isSearching;
    btnSpinner.hidden = !isSearching;
    btnSearchLabel.textContent = isSearching ? "Searching..." : "Search Receipt";
  }

  /* ---------------------------------------------------------
     Toast notifications
  --------------------------------------------------------- */
  function showToast(message, type) {
    clearTimeout(toastTimer);
    toast.classList.remove("is-success", "is-error");
    toast.classList.add(type === "error" ? "is-error" : "is-success");
    toastIcon.innerHTML = type === "error" ? ICON_TOAST_ERROR : ICON_TOAST_SUCCESS;
    toastMessage.textContent = message;
    toast.hidden = false;

    toastTimer = setTimeout(function () {
      toast.hidden = true;
    }, 4000);
  }

  /* ---------------------------------------------------------
     Rendering: empty / error state
  --------------------------------------------------------- */
  function renderState(options) {
    var isError = options.isError;
    resultsEl.innerHTML =
      '<div class="state-card' + (isError ? " is-error" : "") + '">' +
      '<div class="state-card__icon">' + (isError ? ICON_ERROR : ICON_EMPTY) + "</div>" +
      '<h3 class="state-card__title">' + escapeHtml(options.title) + "</h3>" +
      '<p class="state-card__message">' + escapeHtml(options.message) + "</p>" +
      "</div>";
  }

  /* ---------------------------------------------------------
     Rendering: receipt summary card
  --------------------------------------------------------- */
  function pick(obj, keys) {
    for (var i = 0; i < keys.length; i++) {
      var val = obj[keys[i]];
      if (val !== undefined && val !== null && val !== "") return val;
    }
    return null;
  }

  function formatAmount(receipt) {
    var amount = pick(receipt, ["amount", "amountPaid", "total", "value"]);
    if (amount === null) return "—";
    var num = Number(amount);
    if (isNaN(num)) return String(amount);
    var currency = pick(receipt, ["currency"]) || "NGN";
    try {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 2
      }).format(num);
    } catch (e) {
      return "₦" + num.toLocaleString();
    }
  }

  function formatDate(value) {
    if (!value) return "—";
    var date = new Date(value);
    if (isNaN(date.getTime())) return String(value);
    return date.toLocaleString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function statusClass(status) {
    var normalized = String(status || "").toLowerCase();
    if (["success", "successful", "paid", "completed", "confirmed"].indexOf(normalized) !== -1) {
      return "is-success";
    }
    if (["pending", "processing", "initiated"].indexOf(normalized) !== -1) {
      return "is-pending";
    }
    if (["failed", "cancelled", "canceled", "declined"].indexOf(normalized) !== -1) {
      return "is-failed";
    }
    return "is-pending";
  }

  function escapeHtml(value) {
    var div = document.createElement("div");
    div.textContent = value === null || value === undefined ? "" : String(value);
    return div.innerHTML;
  }

  function detailRow(label, value) {
    if (!value) return "";
    return (
      '<div class="detail-row">' +
      '<span class="detail-row__label">' + escapeHtml(label) + "</span>" +
      '<span class="detail-row__value">' + escapeHtml(value) + "</span>" +
      "</div>"
    );
  }

  function renderReceiptList(receipts) {

  resultsEl.innerHTML =
    '<div class="receipt-list">' +
    '<h3 style="margin-bottom:20px;">Select a Receipt</h3>' +

    receipts.map(function(receipt){

      var receiptId = pick(receipt, ["receiptId"]);
      var amount = formatAmount(receipt);
      var paymentDate = formatDate(
          pick(receipt, ["paymentDate","createdAt"])
      );
      var paymentType = pick(receipt, [
          "paymentType",
          "description"
      ]) || "Payment";

      return `
        <div class="receipt-card" style="margin-bottom:16px;">
            <div class="receipt-card__body">

                ${detailRow("Payment", paymentType)}
                ${detailRow("Amount", amount)}
                ${detailRow("Date", paymentDate)}
                ${detailRow("Receipt ID", receiptId)}

            </div>

            <div class="receipt-card__actions">

                <button
                    class="action-btn is-primary"
                    data-receipt="${receiptId}"
                >
                    Open Receipt
                </button>

            </div>

        </div>
      `;

    }).join("") +

    "</div>";



    resultsEl
      .querySelectorAll("[data-receipt]")
      .forEach(function(btn){

        btn.addEventListener("click",function(){

            var id=this.dataset.receipt;

            var receipt=receipts.find(function(r){
                return r.receiptId===id;
            });

            renderReceipt(receipt);

        });

      });

}

  function renderReceipt(receipt) {
    var receiptId = pick(receipt, ["receiptId", "id", "receipt_id"]);
    var studentName = pick(receipt, ["studentName", "name", "fullName", "student_name"]);
    var email = pick(receipt, ["email", "studentEmail"]);
    var status = pick(receipt, ["status", "paymentStatus"]) || "pending";
    var paymentDate = pick(receipt, ["paymentDate", "createdAt", "date", "paidAt"]);
    var reference = pick(receipt, ["reference", "transactionReference", "txRef", "ref"]);
    var organization = pick(receipt, ["organizationName", "organization"]);
    var department = pick(receipt, ["departmentName", "department"]);

    if (organization && typeof organization === "object") {
      organization = pick(organization, ["name"]);
    }
    if (department && typeof department === "object") {
      department = pick(department, ["name"]);
    }

    var rows =
      detailRow("Student Name", studentName) +
      detailRow("Email", email) +
      detailRow("Payment Date", formatDate(paymentDate)) +
      detailRow("Reference", reference) +
      detailRow("Receipt ID", receiptId) +
      detailRow("Organization", organization) +
      detailRow("Department", department);

    resultsEl.innerHTML =
      '<div class="receipt-card">' +
      '<div class="receipt-card__header">' +
      "<div>" +
      '<p class="receipt-card__heading">Amount Paid</p>' +
      '<p class="receipt-card__amount">' + escapeHtml(formatAmount(receipt)) + "</p>" +
      "</div>" +
      '<span class="status-pill ' + statusClass(status) + '">' + escapeHtml(status) + "</span>" +
      "</div>" +
      '<div class="receipt-card__body">' + rows + "</div>" +
      '<div class="receipt-card__actions">' +
      '<button type="button" class="action-btn" data-action="view">' +
      viewIcon() + " View Receipt</button>" +
      '<button type="button" class="action-btn" data-action="pdf">' +
      pdfIcon() + " Download PDF</button>" +
      '<button type="button" class="action-btn is-primary" data-action="email">' +
      emailIcon() + " Email Receipt</button>" +
      "</div>" +
      "</div>";

    var card = resultsEl.querySelector(".receipt-card");
    card.querySelector('[data-action="view"]').addEventListener("click", function () {
      window.open(API_BASE + "/" + encodeURIComponent(receiptId) + "/view", "_blank", "noopener");
    });
    card.querySelector('[data-action="pdf"]').addEventListener("click", function () {
      window.open(API_BASE + "/" + encodeURIComponent(receiptId) + "/pdf", "_blank", "noopener");
    });
    card.querySelector('[data-action="email"]').addEventListener("click", function (evt) {
      emailReceipt(receiptId, evt.currentTarget);
    });

    showToast("Receipt found successfully.", "success");
  }

  function viewIcon() {
    return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>' +
      '<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7"/></svg>';
  }

  function pdfIcon() {
    return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
  }

  function emailIcon() {
    return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.7"/>' +
      '<path d="M3.5 6.5L12 13L20.5 6.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  /* ---------------------------------------------------------
     API calls
  --------------------------------------------------------- */
  function searchReceipt(payload) {
    setSearching(true);
    resultsEl.innerHTML = "";

    fetch(API_BASE + "/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        return response
          .json()
          .catch(function () {
            return {};
          })
          .then(function (data) {
            return { ok: response.ok, status: response.status, data: data };
          });
      })
      .then(function (result) {

    if (result.ok && result.data && result.data.success) {

        // New backend response (multiple receipts)
        if (Array.isArray(result.data.receipts)) {

            if (result.data.receipts.length === 0) {

                renderState({
                    isError: false,
                    title: "No receipt found.",
                    message: "Please check your Email, Receipt ID or Transaction Reference."
                });

            } else if (result.data.receipts.length === 1) {

                renderReceipt(result.data.receipts[0]);

            } else {

                renderReceiptList(result.data.receipts);

            }

        }

        // Backward compatibility with old backend
        else if (result.data.receipt) {

            renderReceipt(result.data.receipt);

        }

    }

    else if (result.status === 404) {

        renderState({
            isError: false,
            title: "No receipt found.",
            message: "Please check your Email, Receipt ID or Transaction Reference."
        });

    }

    else {

        renderState({
            isError: true,
            title: "Something went wrong.",
            message:
                (result.data && result.data.message) ||
                "We couldn't complete your search. Please try again shortly."
        });

    }

})
      .catch(function () {
        renderState({
          isError: true,
          title: "Connection error.",
          message: "We couldn't reach the server. Please check your connection and try again."
        });
      })
      .finally(function () {
        setSearching(false);
      });
  }

  function emailReceipt(receiptId, buttonEl) {
    var originalHtml = buttonEl.innerHTML;
    buttonEl.disabled = true;
    buttonEl.innerHTML = emailIcon() + " Sending...";

    fetch(API_BASE + "/" + encodeURIComponent(receiptId) + "/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    })
      .then(function (response) {
        return response
          .json()
          .catch(function () {
            return {};
          })
          .then(function (data) {
            return { ok: response.ok, data: data };
          });
      })
      .then(function (result) {
        if (result.ok) {
          showToast("Receipt emailed successfully.", "success");
        } else {
          showToast((result.data && result.data.message) || "Could not email the receipt.", "error");
        }
      })
      .catch(function () {
        showToast("Could not email the receipt. Please try again.", "error");
      })
      .finally(function () {
        buttonEl.disabled = false;
        buttonEl.innerHTML = originalHtml;
      });
  }

  /* ---------------------------------------------------------
     Form submit
  --------------------------------------------------------- */
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    hideFieldError();

    var payload = {};

    if (activeMethod === "email") {
      var emailValue = inputs.email.value.trim();
      if (!emailValue) {
        showFieldError("Please enter your email address.");
        inputs.email.focus();
        return;
      }
      if (!isValidEmail(emailValue)) {
        showFieldError("Please enter a valid email address.");
        inputs.email.focus();
        return;
      }
      payload.email = emailValue;
    } else if (activeMethod === "receiptId") {
      var receiptIdValue = inputs.receiptId.value.trim();
      if (!receiptIdValue) {
        showFieldError("Please enter a receipt ID.");
        inputs.receiptId.focus();
        return;
      }
      payload.receiptId = receiptIdValue;
    } else if (activeMethod === "reference") {
      var referenceValue = inputs.reference.value.trim();
      if (!referenceValue) {
        showFieldError("Please enter a transaction reference.");
        inputs.reference.focus();
        return;
      }
      payload.reference = referenceValue;
    }

    searchReceipt(payload);
  });

  /* ---------------------------------------------------------
     Init
  --------------------------------------------------------- */
  setActiveTab("email");
})();