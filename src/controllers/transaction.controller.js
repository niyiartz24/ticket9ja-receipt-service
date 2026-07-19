const transactionService = require("../services/transaction.service");

exports.getAll = async (req, res) => {
    try {

        const result = await transactionService.getAll(
            req.user,
            req.query
        );

        res.json({
            success: true,
            ...result
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

exports.getOne = async (req, res) => {

    try {

        const transaction =
            await transactionService.getOne(
                req.user,
                req.params.id
            );

        res.json({
            success: true,
            transaction
        });

    } catch (err) {

        res.status(404).json({
            success: false,
            message: err.message
        });

    }

};