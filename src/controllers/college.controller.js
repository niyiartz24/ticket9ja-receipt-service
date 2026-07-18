const collegeService =
require("../services/college.service");

exports.getAll = async (req, res) => {

    try {

        const colleges =
            await collegeService.getAll();

        res.json({
            success: true,
            colleges
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

        const college =
            await collegeService.getById(
                req.params.id
            );

        res.json({
            success: true,
            college
        });

    } catch (err) {

        res.status(404).json({
            success: false,
            message: err.message
        });

    }

};

exports.getByOrganization = async (req, res) => {

    try {

        const colleges =
            await collegeService.getByOrganization(
                req.params.organizationId
            );

        res.json({
            success: true,
            colleges
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

exports.create = async (req, res) => {

    try {

        const college =
            await collegeService.create(req.body);

        res.status(201).json({
            success: true,
            college
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

        const college =
            await collegeService.update(
                req.params.id,
                req.body
            );

        res.json({
            success: true,
            college
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

        await collegeService.remove(
            req.params.id
        );

        res.json({

            success: true,

            message: "College deactivated."

        });

    } catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};