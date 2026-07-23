const walletHistoryService =
require("../services/walletHistory.service");

exports.list = async (req, res) => {

    try {

        const history =
        await walletHistoryService.list(req.user);

        res.json({

            success: true,

            history

        });

    }

    catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};