const walletService =
require("../services/wallet.service");

exports.getMine = async (req, res) => {

    try {

        const wallet =
            await walletService.getWallet(
                req.user
            );

        res.json({

            success: true,
            wallet

        });

    } catch (err) {

        res.status(400).json({

            success: false,
            message: err.message

        });

    }

};