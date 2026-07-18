const service = require("../services/bankAccount.service");

exports.create = async (req, res) => {

    try {

        const account =
            await service.create(req.body);

        res.status(201).json({

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

exports.getByOrganization = async (req, res) => {

    try {

        const accounts =
            await service.getByOrganization(
                req.params.organizationId
            );

        res.json({

            success: true,

            accounts

        });

    } catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};

exports.makeDefault = async (req, res) => {

    try {

        const account =
            await service.makeDefault(
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