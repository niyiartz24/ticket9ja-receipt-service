/* ==========================================================================
   Ticket9jaPay — success.js
   Verifies payment after BudPay redirects back to this page.
   ========================================================================== */

(function initSuccessPage() {

    const heading = document.getElementById("successHeading");
    const message = document.querySelector(".success-card p");
    const referenceText = document.getElementById("successReference");

    const retrieveBtn = document.getElementById("retrieveReceiptBtn");
    const homeBtn = document.getElementById("homeBtn");

    const BACKEND_URL = "https://ticket9ja-receipt-service.onrender.com/api";

    const params = new URLSearchParams(window.location.search);
    const reference =
        params.get("reference") ||
        params.get("trxref");

    if (!reference) {

        heading.textContent = "Payment Reference Missing";

        message.textContent =
            "We couldn't verify this payment because no payment reference was provided.";

        retrieveBtn.disabled = true;

        return;

    }

    referenceText.hidden = false;
    referenceText.textContent = `Reference: ${reference}`;

    heading.textContent = "Verifying Payment...";

    message.textContent =
        "Please wait while we confirm your payment.";

    retrieveBtn.disabled = true;

    fetch(`${BACKEND_URL}/payments/verify/${reference}`)

        .then(async (response) => {

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Verification failed.");
            }

            return data;

        })

        .then((data) => {

            heading.textContent = "Payment Successful";

            message.textContent =
                "Your payment has been verified successfully. Your receipt has been generated and emailed.";

            retrieveBtn.disabled = false;

            retrieveBtn.onclick = function () {

                window.location.href =
                    `${BACKEND_URL}/receipts/${data.receipt.receiptId}/view`;

            };

        })

        .catch((error) => {

            console.error(error);

            heading.textContent = "Verification Failed";

            message.textContent =
                error.message ||
                "We could not verify your payment automatically. Please retrieve your receipt using your email or reference.";

            retrieveBtn.textContent = "Retrieve Receipt";

            retrieveBtn.disabled = false;

            retrieveBtn.onclick = function () {

                window.location.href = "index.html";

            };

        });

    homeBtn.onclick = function () {

        window.location.href = "index.html";

    };

})();