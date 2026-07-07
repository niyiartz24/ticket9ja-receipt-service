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


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../public")));
app.use("/api/payments", paymentRoutes);

app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

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
    res.send("Payment completed successfully. You can close this page.");
});

app.use("/api/webhooks", webhookRoutes);
app.use("/api/receipts", receiptRoutes);

module.exports = app;
