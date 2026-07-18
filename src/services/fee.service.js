const prisma = require("../config/prisma");

exports.calculate = async (amount) => {

    const settings =
        await prisma.platformSettings.findFirst();

    if (!settings) {

        throw new Error(
            "Platform settings not configured."
        );

    }

    let fee = 0;

    if (settings.feeType === "FIXED") {

        fee = settings.feeValue;

    } else {

        fee = (amount * settings.feeValue) / 100;

    }

    fee = Number(fee.toFixed(2));

    return {

        amount,

        fee,

        total: Number((amount + fee).toFixed(2))

    };

};