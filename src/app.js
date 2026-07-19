const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");



const webhookRoutes = require("./routes/webhook.routes");
const receiptRoutes = require("./routes/receipt.routes");
const paymentRoutes = require("./routes/payment.routes");
const { Prisma } = require("@prisma/client");
const verifyRoutes = require("./routes/verify.routes");
const organizationRoutes = require("./routes/organization.routes");
const departmentRoutes = require("./routes/department.routes");
const paymentTypeRoutes = require("./routes/paymentType.routes");
const sessionRoutes = require("./routes/session.routes");
const authRoutes = require('./auth/auth.routes');
const collegeRoutes = require("./routes/college.routes");
const bankAccountRoutes = require("./routes/bankAccount.routes");
const withdrawalRoutes = require("./routes/withdrawal.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const organizationDashboardRoutes = require("./routes/organizationDashboard.routes");
const publicRoutes = require("./routes/public.routes");
const transactionRoutes = require("./routes/transaction.routes");
const adminRoutes = require("./routes/admin.routes");
const notificationRoutes = require("./routes/notification.routes");
const platformRoutes = require("./routes/platform.routes");
const invitationRoutes = require("./routes/invitation.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../public")));
app.use("/api/payments", paymentRoutes);


app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

app.use("/verify", verifyRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/payment-types", paymentTypeRoutes);
app.use("/api/sessions", sessionRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/bank-accounts", bankAccountRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/organization-dashboard", organizationDashboardRoutes);

app.use(
    "/api/organization-withdrawals",
    require("./routes/organizationWithdrawal.routes")
);

app.use(
    "/api/college-withdrawals",
    require("./routes/collegeWithdrawal.routes")
);

app.use(
    "/api/department-withdrawals",
    require("./routes/departmentWithdrawal.routes")
);

app.use(
    "/api/public",
    publicRoutes
);

app.use(
    "/api/transactions",
    transactionRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

app.use(
    "/api/notifications",
    notificationRoutes
);

app.use(
    "/api/platform",
    platformRoutes
);

app.use(
    "/api/invitations",
    invitationRoutes
);

app.get("/", (req, res) => {
    res.json({
        service: "Ticket9ja Receipt API",
        version: "1.0.0",
        status: "Running"
    });
});

app.get("/debug/schema", (req, res) => {
  const transaction = Prisma.dmmf.datamodel.models.find(
    (m) => m.name === "Transaction"
  );

  res.json({
    fields: transaction.fields.map((f) => ({
      name: f.name,
      unique: f.isUnique,
      required: f.isRequired
    }))
  });
});

app.get("/payment-success", (req, res) => {
    res.sendFile(path.join(__dirname, "../main/success.html"));
});

app.use("/api/webhooks", webhookRoutes);
app.use("/api/receipts", receiptRoutes);

module.exports = app;
