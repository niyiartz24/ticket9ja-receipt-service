const PAYMENT_METHOD_MAP = {
    card: "CARD",
    transfer: "BANK_TRANSFER",
    bank_transfer: "BANK_TRANSFER",
    ussd: "USSD",
    wallet: "WALLET",
    budpay: "BUDPAY"
};

exports.mapPaymentMethod = (channel) => {

    if (!channel) {
        return "BUDPAY";
    }

    const normalized = String(channel)
        .trim()
        .toLowerCase();

    return PAYMENT_METHOD_MAP[normalized] || "BUDPAY";
};