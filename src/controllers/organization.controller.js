const organizationService =
require("../services/organization.service");

exports.getAll = async (req, res) => {

    try {

        const organizations =
            await organizationService.getAll();

        res.json({
            success: true,
            organizations
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

exports.getById = async (req, res) => {

    try {

        const organization =
            await organizationService.getById(
                req.params.id
            );

        res.json({
            success: true,
            organization
        });

    } catch (err) {

        res.status(404).json({
            success: false,
            message: err.message
        });

    }

};

exports.create = async (req, res) => {

    try {

        const organization =
            await organizationService.create(req.body);

        res.status(201).json({

            success: true,

            organization

        });

    } catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};

exports.update = async (req, res) => {

    try {

        const organization =
            await organizationService.update(
                req.params.id,
                req.body
            );

        res.json({

            success: true,

            organization

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

        await organizationService.remove(req.params.id);

        res.json({

            success: true,

            message: "Organization deactivated."

        });

    } catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};

exports.getPublic = async (req, res) => {

    try {

        const organizations =
            await organizationService.getPublic();

        res.json({

            success: true,

            organizations

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.getPublicById = async (req, res) => {

    try {

        const organization =
            await organizationService.getPublicById(
                req.params.id
            );

        res.json({

            success: true,

            organization

        });

    }

    catch (err) {

        res.status(404).json({

            success: false,

            message: err.message

        });

    }

};