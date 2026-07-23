const organizationWallet = require("../services/organizationWallet.service");

exports.getWallet = async (req, res) => {
    try {
        const wallet = await organizationWallet.details(req.user.organizationId);

        res.json({
            success: true,
            wallet
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};