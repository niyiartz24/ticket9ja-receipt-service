const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const webhookRoutes = require("./routes/webhook.routes");
const receiptRoutes = require("./routes/receipt.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use("/api/webhooks", webhookRoutes);
app.use("/api/receipts", receiptRoutes);

module.exports = app;