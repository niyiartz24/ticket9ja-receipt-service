/* ==========================================================================
   Ticket9jaPay — success.js
   Logic for success.html. This page is a static confirmation screen; the
   backend emails the receipt automatically, so no API calls are required
   here. We only surface the payment reference if BudPay included one in
   the redirect's query string.
   ========================================================================== */

(function initSuccessPage() {
  const refChip = document.getElementById("refChip");
  if (!refChip) return; // Not on the success page.

  const urlParams = new URLSearchParams(window.location.search);
  const reference = urlParams.get("reference") || urlParams.get("trxref");

  if (reference) {
    refChip.textContent = `Reference: ${reference}`;
    refChip.hidden = false;
  } else {
    refChip.hidden = true;
  }
})();