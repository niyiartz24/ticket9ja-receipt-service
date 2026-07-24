const axios = require("axios");

const BASE_URL = "https://api.budpay.com/api/v2";

const headers = {
    Authorization: `Bearer ${process.env.BUDPAY_SECRET_KEY}`,
    "Content-Type": "application/json"
};

/*
|--------------------------------------------------------------------------
| Get all Nigerian banks
|--------------------------------------------------------------------------
*/

exports.getBanks = async () => {
    try {

        const { data } = await axios.get(
            `${BASE_URL}/bank_list/NGN`,
            { headers }
        );

        return data.data || [];

    } catch (err) {

        console.error(err.response?.data || err.message);

        throw new Error("Unable to load banks.");

    }
};

exports.verifyAccount = async (
    bankCode,
    accountNumber
) => {

    try {

        const { data } = await axios.post(
            `${BASE_URL}/account_name_verify`,
            {
                bank_code: bankCode,
                account_number: accountNumber
            },
            { headers }
        );

        return {

            accountName: data.data,
            accountNumber,
            bankCode

        };

    } catch (err) {

        console.error(err.response?.data || err.message);

        throw new Error("Unable to verify bank account.");

    }
};

/*
|--------------------------------------------------------------------------
| Verify Account Number
|--------------------------------------------------------------------------
*/

exports.verifyAccount = async (
    bankCode,
    accountNumber
) => {

    try {

        const { data } = await axios.post(

            `${BASE_URL}/bank/verify`,

            {
                bank_code: bankCode,
                account_number: accountNumber
            },

            { headers }

        );

        return {

            accountName: data.data.account_name,
            accountNumber: data.data.account_number,
            bankCode

        };

    } catch (err) {

        console.error(err.response?.data || err.message);

        throw new Error("Unable to verify bank account.");

    }

};

/*
|--------------------------------------------------------------------------
| Webhook
|--------------------------------------------------------------------------
*/

exports.processWebhook = async (payload) => {

    console.log("\n================================");
    console.log("BUDPAY WEBHOOK");
    console.log(JSON.stringify(payload, null, 2));
    console.log("================================\n");

    return true;

};