const axios = require("axios");

exports.initialize = async (paymentData) => {
  const reference = `TKT9JA-${Date.now()}`;

  const payload = {
    email: paymentData.email,
    amount: String(paymentData.amount), // BudPay expects a string
    currency: "NGN",
    reference: reference,
    callback: `${process.env.BASE_URL}/payment-success`,
  };

  const response = await axios.post(
    "https://api.budpay.com/api/v2/transaction/initialize",
    payload,
    {
      headers: {
        Authorization: `Bearer ${process.env.BUDPAY_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};