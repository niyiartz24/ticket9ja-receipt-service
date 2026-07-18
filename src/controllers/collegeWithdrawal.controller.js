const organizationWithdrawalService = require("../services/collegeWithdrawal.service");

exports.request = async (req, res) => {
    try {

        const withdrawal =
            await collegeWithdrawalService.requestWithdrawal(
                req.user.collegeId,
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
            await collegeWithdrawalService.getHistory(
                req.user.collegeId
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
            await collegeWithdrawalService.getPending();

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
            await collegeWithdrawalService.approve(
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
            await collegeWithdrawalService.reject(
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