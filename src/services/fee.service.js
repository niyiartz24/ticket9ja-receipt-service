const prisma = require("../config/prisma");

exports.calculate = async (amount) => {
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
        throw new Error("Invalid payment amount.");
    }

    const feeConfig = await prisma.platformFee.findFirst();

    const percentage = feeConfig
        ? Number(feeConfig.percentage)
        : 1.5;

    const flat = feeConfig
        ? Number(feeConfig.flat)
        : 50;

    let fee =
        (numericAmount * percentage) / 100 +
        flat;

    if (
        feeConfig?.cap !== null &&
        feeConfig?.cap !== undefined
    ) {
        fee = Math.min(
            fee,
            Number(feeConfig.cap)
        );
    }

    fee = Number(fee.toFixed(2));

    const total = Number(
        (numericAmount + fee).toFixed(2)
    );

    return {
        amount: numericAmount,
        fee,
        total
    };
};