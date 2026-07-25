const axios = require("axios");

const api = axios.create({
    baseURL: "https://api.budpay.com/api/v2",
    headers: {
        Authorization: `Bearer ${process.env.BUDPAY_SECRET_KEY}`,
        "Content-Type": "application/json"
    },
    timeout: 30000
});

/*
|--------------------------------------------------------------------------
| Get Nigerian Banks
|--------------------------------------------------------------------------
*/

exports.getBanks = async () => {

    try {

        const { data } = await api.get("/bank_list/NGN");

        console.log("========== BUDPAY BANK RESPONSE ==========");
        console.dir(data, { depth: null });
        console.log("==========================================");

        // Different BudPay versions return different structures

        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        if (Array.isArray(data.banks)) {
            return data.banks;
        }

        if (Array.isArray(data.data?.banks)) {
            return data.data.banks;
        }

        return [];

    } catch (err) {

        console.error("========== BUDPAY BANK ERROR ==========");
        console.error(err.response?.status);
        console.dir(err.response?.data, { depth: null });
        console.error(err.message);
        console.error("=======================================");

        throw new Error("Unable to load banks.");

    }

};

/*
|--------------------------------------------------------------------------
| Verify Account Name
|--------------------------------------------------------------------------
*/

exports.verifyAccount = async (
    bankCode,
    accountNumber
) => {

    try {

        const { data } = await api.post(
            "/account_name_verify",
            {
                bank_code: bankCode,
                account_number: accountNumber
            }
        );

        console.log("======= BUDPAY VERIFY RESPONSE =======");
        console.dir(data, { depth: null });
        console.log("======================================");

        const accountName =
            data?.data?.account_name ||
            data?.data?.accountName ||
            data?.data ||
            data?.account_name ||
            data?.accountName;

        return {

            accountName,
            accountNumber,
            bankCode

        };

    } catch (err) {

        console.error("========== VERIFY ERROR ==========");
        console.error(err.response?.status);
        console.dir(err.response?.data, { depth: null });
        console.error(err.message);
        console.error("==================================");

        throw new Error("Unable to verify bank account.");

    }

};

/*
|--------------------------------------------------------------------------
| Process Webhook
|--------------------------------------------------------------------------
*/

exports.processWebhook = async (payload) => {

    console.log("\n========================================");
    console.log("BUDPAY WEBHOOK RECEIVED");
    console.log(JSON.stringify(payload, null, 2));
    console.log("========================================\n");

    return true;

};