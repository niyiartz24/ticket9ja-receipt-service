const withdrawalService =
require("../services/withdrawal.service");

exports.request = async (req, res) => {

    try {

        const withdrawal =
            await withdrawalService.request(
                req.user,
                req.body
            );

        res.status(201).json({

            success: true,
            withdrawal

        });

    } catch (err) {

        res.status(400).json({

            success: false,
            message: err.message

        });

    }

};

exports.getMine = async (req, res) => {

    try {

        const withdrawals =
            await withdrawalService.getHistory(
                req.user
            );

        res.json({

            success: true,
            withdrawals

        });

    } catch (err) {

        res.status(500).json({

            success: false,
            message: err.message

        });

    }

};

exports.getPending = async (req, res) => {

    try {

        const withdrawals =
            await withdrawalService.getPending(
                req.user
            );

        res.json({

            success: true,
            withdrawals

        });

    } catch (err) {

        res.status(500).json({

            success: false,
            message: err.message

        });

    }

};

exports.approve = async (req, res) => {

    try {

        const withdrawal =
            await withdrawalService.approve(

                req.params.id,

                req.user.id

            );

        res.json({

            success: true,
            withdrawal

        });

    } catch (err) {

        res.status(
            err.message.includes("not found") ? 404 : 400
        ).json({

            success: false,
            message: err.message

        });

    }

};

exports.reject = async (req, res) => {

    try {

        const withdrawal =
            await withdrawalService.reject(

                req.params.id,

                req.user.id

            );

        res.json({

            success: true,
            withdrawal

        });

    } catch (err) {

        res.status(
            err.message.includes("not found") ? 404 : 400
        ).json({

            success: false,
            message: err.message

        });

    }

};