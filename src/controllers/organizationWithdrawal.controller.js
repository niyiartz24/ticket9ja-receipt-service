const organizationWithdrawalService = require("../services/organizationWithdrawal.service");

exports.request = async (req, res) => {
    try {

        const withdrawal =
            await organizationWithdrawalService.requestWithdrawal(
                req.user.organizationId,
                Number(req.body.amount)
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

exports.history = async (req, res) => {

    try {

        const withdrawals =
            await organizationWithdrawalService.getHistory(
                req.user.organizationId
            );

        res.json({
            success: true,
            withdrawals
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};

exports.pending = async (req, res) => {

    try {

        const withdrawals =
            await organizationWithdrawalService.getPending();

        res.json({
            success: true,
            withdrawals
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};

exports.approve = async (req, res) => {

    try {

        const withdrawal =
            await organizationWithdrawalService.approve(
                req.params.id,
                req.user.id
            );

        res.json({
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

exports.reject = async (req, res) => {

    try {

        const withdrawal =
            await organizationWithdrawalService.reject(
                req.params.id,
                req.user.id
            );

        res.json({
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