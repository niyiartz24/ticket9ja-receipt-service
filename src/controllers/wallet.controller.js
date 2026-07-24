const organizationWallet = require("../services/organizationWallet.service");

exports.getWallet = async (req, res) => {
    try {

        const wallet =
            await organizationWallet.details(
                req.user.organizationId
            );

        res.json({
            success: true,
            balance: Number(wallet.availableBalance),
            pending: Number(wallet.pendingBalance),
            reserved: Number(wallet.reservedBalance),
            withdrawn: Number(wallet.withdrawnBalance),
            totalRevenue: Number(wallet.totalRevenue),
            lastPayoutAt: wallet.updatedAt
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};