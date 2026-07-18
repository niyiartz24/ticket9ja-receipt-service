const paymentTypeService =
    require("../services/paymentType.service");

exports.getAll = async (req, res) => {

    try {

        const paymentTypes =
            await paymentTypeService.getAll();

        return res.json({

            success: true,

            paymentTypes

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.getById = async (req, res) => {

    try {

        const paymentType =
            await paymentTypeService.getById(
                req.params.id
            );

        return res.json({

            success: true,

            paymentType

        });

    } catch (err) {

        return res.status(404).json({

            success: false,

            message: err.message

        });

    }

};

exports.getByOrganization = async (req, res) => {

    try {

        const paymentTypes =
            await paymentTypeService.getByOrganization(
                req.params.organizationId
            );

        return res.json({

            success: true,

            paymentTypes

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.getByCollege = async (req, res) => {

    try {

        const paymentTypes =
            await paymentTypeService.getByCollege(
                req.params.collegeId
            );

        return res.json({

            success: true,

            paymentTypes

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.getByDepartment = async (req, res) => {

    try {

        const paymentTypes =
            await paymentTypeService.getByDepartment(
                req.params.departmentId
            );

        return res.json({

            success: true,

            paymentTypes

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.create = async (req, res) => {

    try {

        const paymentType =
            await paymentTypeService.create(
                req.body
            );

        return res.status(201).json({

            success: true,

            paymentType

        });

    } catch (err) {

        return res.status(400).json({

            success: false,

            message: err.message

        });

    }

};

exports.update = async (req, res) => {

    try {

        const paymentType =
            await paymentTypeService.update(
                req.params.id,
                req.body
            );

        return res.json({

            success: true,

            paymentType

        });

    } catch (err) {

        return res.status(400).json({

            success: false,

            message: err.message

        });

    }

};

exports.remove = async (req, res) => {

    try {

        await paymentTypeService.remove(
            req.params.id
        );

        return res.json({

            success: true,

            message: "Payment type deactivated successfully."

        });

    } catch (err) {

        return res.status(400).json({

            success: false,

            message: err.message

        });

    }

};

exports.calculate =
async (req, res) => {

    try {

        const payment =
            await paymentTypeService.calculate(
                req.params.id
            );

        res.json({

            success: true,

            payment

        });

    }

    catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};