const service = require("../services/bankAccount.service");

exports.save = async (req, res) => {

    try {

        const account = await service.save(
            req.user,
            req.body
        );

        res.json({
            success: true,
            account
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

        const accounts =
            await service.getMine(req.user);

        res.json({
            success: true,
            data: accounts
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

exports.makeDefault = async (req, res) => {

    try {

        const account =
            await service.makeDefault(
                req.user,
                req.params.id
            );

        res.json({

            success: true,

            account

        });

    } catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};

exports.remove = async (req, res) => {

    try {

        await service.remove(
    req.user,
    req.params.id
);

        res.json({

            success: true,

            message: "Bank account deleted."

        });

    } catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};

exports.verify = async (req, res) => {

    try {

        const result =
            await service.verify(req.body);

        res.json({
            success: true,
            ...result
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};

exports.getBanks = async (req, res) => {

    try {

        const banks = await service.getBanks();

        res.json({

            success: true,
            data: banks

        });

    } catch (err) {

        res.status(500).json({

            success: false,
            message: err.message

        });

    }

};

exports.getAll = async (req, res) => {

    try {

        const accounts =
            await service.getAll();

        res.json({

            success: true,

            data: accounts

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};