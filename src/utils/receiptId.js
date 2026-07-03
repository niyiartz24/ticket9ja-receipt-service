const crypto = require("crypto");

function generateReceiptId() {
    return `RCT-${new Date().getFullYear()}-${crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase()}`;
}

module.exports = generateReceiptId;