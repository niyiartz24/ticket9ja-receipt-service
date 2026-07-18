const organizationWithdrawalService = require("../services/departmentWithdrawal.service");

exports.request = async (req, res) => {
    try {

        const withdrawal =
            await departmentWithdrawalService.requestWithdrawal(
                req.user.departmentId,
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
            await departmentWithdrawalService.getHistory(
                req.user.departmentId
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
            await departmentWithdrawalService.getPending();

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
            await departmentWithdrawalService.approve(
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
            await departmentWithdrawalService.reject(
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