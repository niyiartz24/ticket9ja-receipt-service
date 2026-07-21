/* ==========================================================================
   Ticket9jaPay — payments.js
   Logic for payments.html: loads context from the URL, renders the payment
   summary + student form, validates input, and initiates payment.
   Depends on the shared helpers defined in app.js (loaded first).
   ========================================================================== */

(function initPaymentsPage() {
  const formCard = document.getElementById("paymentForm");
  if (!formCard) return; // Not on the payments page.

  /* ---------------------------------------------------------------
     Elements
     --------------------------------------------------------------- */
  const summaryCard = document.getElementById("summaryCard");
  const pageAlert = document.getElementById("pageAlert");
  const formSection = document.getElementById("formSection");

  const orgNameEl = document.getElementById("summaryOrgName");
  const payNameEl = document.getElementById("summaryPayName");
  const payDescEl = document.getElementById("summaryPayDesc");
  const amountEl = document.getElementById("summaryAmount");

  const departmentSelect = document.getElementById("departmentSelect");
  const departmentField = document.getElementById("departmentField");
  const collegeSelect = document.getElementById("collegeSelect");
  const collegeField = document.getElementById("collegeField");
  const sessionField = document.getElementById("sessionField");
  const sessionDisplay = document.getElementById("sessionDisplay");
  const sessionHiddenId = document.getElementById("sessionHiddenId");

  const submitBtn = document.getElementById("submitBtn");
  const submitBtnLabel = document.getElementById("submitBtnLabel");
  const formAlert = document.getElementById("formAlert");

  /* ---------------------------------------------------------------
     Context from URL
     --------------------------------------------------------------- */
  const urlParams = new URLSearchParams(window.location.search);
  const organizationId = urlParams.get("organizationId");
  const paymentTypeId = urlParams.get("paymentTypeId");

  let currentOrganization = null;
  let currentPaymentType = null;
  let currentColleges = [];
let currentDepartments = [];
  let currentSession = null;

  if (!organizationId || !paymentTypeId) {
    showFatalError(
      "Missing payment details",
      "We couldn't find a payment to load. Please start again from the home page."
    );
    return;
  }

  /* ---------------------------------------------------------------
     Fatal error
     --------------------------------------------------------------- */
  function showFatalError(title, message) {
    formSection.hidden = true;
    summaryCard.innerHTML = `<div class="skeleton-line" style="width:40%"></div>`;

    showAlert(pageAlert, {
      title,
      message,
      type: "error",
      retryFn: () => window.location.reload()
    });

    const backLink = document.createElement("a");
    backLink.href = "home.html";
    backLink.className = "btn btn-secondary";
    backLink.style.marginTop = "12px";
    backLink.textContent = "Back to home";
    pageAlert.appendChild(backLink);
  }

  /* ---------------------------------------------------------------
     Ignore missing optional endpoints
     --------------------------------------------------------------- */
  async function optionalGet(url) {
    try {
      return await apiGet(url);
    } catch (error) {
      const status =
        error?.status ||
        error?.response?.status ||
        error?.response?.data?.statusCode;

      const message =
        error?.message ||
        error?.response?.data?.message ||
        "";

      if (
        status === 404 ||
        /404/.test(String(message)) ||
        /not found/i.test(String(message))
      ) {
        return [];
      }

      throw error;
    }
  }

  /* ---------------------------------------------------------------
     Load context
     --------------------------------------------------------------- */
  async function loadContext() {
    clearAlert(pageAlert);

    try {
      const [
    orgData,
    paymentTypesData,
    collegesData,
    departmentsData,
    sessionsData
] = await Promise.all([
    apiGet("/public/organizations"),
    apiGet(`/public/organizations/${organizationId}/payment-types`),
    optionalGet(`/public/organizations/${organizationId}/colleges`),
    optionalGet(`/public/organizations/${organizationId}/departments`),
    optionalGet("/public/sessions")
]);

      const organizations = normalizeList(orgData, ["organizations"]);
      const paymentTypes = normalizeList(paymentTypesData, ["paymentTypes"]);
      const colleges = normalizeList(collegesData, ["colleges"]);
      const departments = normalizeList(departmentsData, ["departments"]);
      const sessions = normalizeList(sessionsData, ["sessions"]);

      currentOrganization =
        organizations.find(
          (o) => pickField(o, ["id"], "") === organizationId
        ) || null;

      currentPaymentType =
        paymentTypes.find(
          (p) => pickField(p, ["id"], "") === paymentTypeId
        ) || null;

      currentColleges = colleges.filter(c =>
    pickField(c, ["organizationId"], organizationId) === organizationId
);

      currentDepartments = departments.filter(
        (d) =>
          pickField(d, ["organizationId"], organizationId) ===
          organizationId
      );

      const activeSessions = sessions.filter(
        (s) =>
          pickField(s, ["active", "isActive"], false) === true
      );

      currentSession = activeSessions[0] || sessions[0] || null;

      if (!currentOrganization || !currentPaymentType) {
        showFatalError(
          "Payment not found",
          "This payment link looks invalid or may have expired. Please start again from the home page."
        );
        return;
      }

     renderSummary();
renderColleges();
renderDepartments();
renderSession();

      formSection.hidden = false;
    } catch (error) {
      const { title, message } = describeError(error);
      showFatalError(title, message);
    }
  }

  /* ---------------------------------------------------------------
     Summary
     --------------------------------------------------------------- */
  function renderSummary() {
    const orgName = pickField(
      currentOrganization,
      ["name", "title"],
      "Institution"
    );

    const payTitle = pickField(
      currentPaymentType,
      ["title", "name"],
      "Payment"
    );

    const payDesc = pickField(
      currentPaymentType,
      ["description", "summary"],
      ""
    );

    const amount = pickField(
      currentPaymentType,
      ["defaultAmount", "amount"],
      0
    );

    orgNameEl.textContent = orgName;
    payNameEl.textContent = payTitle;
    payDescEl.textContent = payDesc;
    payDescEl.hidden = !payDesc;
    amountEl.textContent = formatCurrency(amount);
  }

  function renderColleges() {

    if (!currentColleges.length) {
        collegeField.hidden = true;
        return;
    }

    collegeField.hidden = false;

    collegeSelect.innerHTML =
        `<option value="">Select college</option>` +
        currentColleges.map(college => {

            const id = pickField(college, ["id"], "");

            const name = escapeHTML(
                pickField(college, ["name"], "College")
            );

            return `
                <option value="${id}">
                    ${name}
                </option>
            `;

        }).join("");
}

  /* ---------------------------------------------------------------
     Departments (optional)
     --------------------------------------------------------------- */
  function renderDepartments() {
    if (!currentDepartments.length) {
      departmentField.hidden = true;
      return;
    }

    departmentField.hidden = false;

    departmentSelect.innerHTML =
      `<option value="">Select department</option>` +
      currentDepartments
        .map((dept) => {
          const id = pickField(dept, ["id"], "");
          const name = escapeHTML(
            pickField(dept, ["name", "title"], "Department")
          );

          return `<option value="${escapeHTML(
            id
          )}">${name}</option>`;
        })
        .join("");
  }

  /* ---------------------------------------------------------------
     Session (optional)
     --------------------------------------------------------------- */
  function renderSession() {
    if (!currentSession) {
      sessionField.hidden = true;
      return;
    }

    sessionField.hidden = false;

    sessionDisplay.value = pickField(
      currentSession,
      ["name", "title", "year"],
      ""
    );

    sessionHiddenId.value = pickField(
      currentSession,
      ["id"],
      ""
    );
  }

  /* ---------------------------------------------------------------
     Validation
     --------------------------------------------------------------- */
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_PATTERN = /^(\+?234|0)[789][01]\d{8}$/;

  function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const wrapper = field.closest(".field");
    const errorEl = wrapper.querySelector(".error-text");

    wrapper.classList.add("has-error");
    if (errorEl) errorEl.textContent = message;
  }

  function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const wrapper = field.closest(".field");

    wrapper.classList.remove("has-error");

    const errorEl = wrapper.querySelector(".error-text");
    if (errorEl) errorEl.textContent = "";
  }

  function validateForm() {
    let isValid = true;

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const matricNumber = document
      .getElementById("matricNumber")
      .value.trim();
    const level = document.getElementById("level").value.trim();

    [
      "fullName",
      "email",
      "phone",
      "matricNumber",
      "level"
    ].forEach(clearFieldError);

    if (!departmentField.hidden)
      clearFieldError("departmentSelect");

    if (!fullName) {
      setFieldError("fullName", "Enter your full name.");
      isValid = false;
    }

    if (!email) {
      setFieldError("email", "Enter your email address.");
      isValid = false;
    } else if (!EMAIL_PATTERN.test(email)) {
      setFieldError("email", "Enter a valid email address.");
      isValid = false;
    }

    if (!phone) {
      setFieldError("phone", "Enter your phone number.");
      isValid = false;
    } else if (!PHONE_PATTERN.test(phone.replace(/\s/g, ""))) {
      setFieldError(
        "phone",
        "Enter a valid Nigerian phone number."
      );
      isValid = false;
    }

    if (!matricNumber) {
      setFieldError(
        "matricNumber",
        "Enter your matric number."
      );
      isValid = false;
    }

    if (!level) {
      setFieldError("level", "Select your level.");
      isValid = false;
    }

    if (
      !departmentField.hidden &&
      !departmentSelect.value
    ) {
      setFieldError(
        "departmentSelect",
        "Select your department."
      );
      isValid = false;
    }

    return isValid;
  }

  /* ---------------------------------------------------------------
     Submit
     --------------------------------------------------------------- */
  function setSubmitting(isSubmitting) {
    submitBtn.disabled = isSubmitting;
    submitBtnLabel.textContent = isSubmitting
      ? "Processing..."
      : "Proceed to Payment";

    const spinner = submitBtn.querySelector(".spinner");

    if (isSubmitting && !spinner) {
      const s = document.createElement("span");
      s.className = "spinner";
      s.setAttribute("aria-hidden", "true");
      submitBtn.prepend(s);
    } else if (!isSubmitting && spinner) {
      spinner.remove();
    }
  }

  formCard.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearAlert(formAlert);

    if (!validateForm()) {
      showAlert(formAlert, {
        title: "Check the form",
        message:
          "Some fields need your attention before we can continue.",
        type: "error"
      });
      return;
    }

    const payload = {
      payerName: document
        .getElementById("fullName")
        .value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      matricNumber: document
        .getElementById("matricNumber")
        .value.trim(),
      level: document.getElementById("level").value.trim(),
      organizationId,
      collegeId:
    selectedCollegeId || null,
      departmentId: departmentField.hidden
        ? ""
        : departmentSelect.value,
      paymentTypeId
    };

    setSubmitting(true);

    try {
      const result = await apiPost(
    "/public/payments/initiate",
    payload
);

      if (result && result.status === false) {
        throw new Error(
          result.message ||
            "Payment initialization failed."
        );
      }

      const authorizationUrl =
        result?.data?.authorization_url;

      if (!authorizationUrl) {
        throw new Error(
          "We could not start the payment. Please try again."
        );
      }

      window.location.href = authorizationUrl;
    } catch (error) {
      setSubmitting(false);

      const { title, message } = describeError(error);

      showAlert(formAlert, {
        title,
        message,
        type: "error"
      });
    }
  });

  loadContext();
})();