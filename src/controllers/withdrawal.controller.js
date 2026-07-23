const organizationService =
require("../services/organizationWithdrawal.service");

const collegeService =
require("../services/collegeWithdrawal.service");

const departmentService =
require("../services/departmentWithdrawal.service");

exports.getPending = async (req, res) => {

    try {

        const [

            organizations,

            colleges,

            departments

        ] = await Promise.all([

            organizationService.getPending(),

            collegeService.getPending(),

            departmentService.getPending()

        ]);

        const withdrawals = [

            ...organizations.map(x => ({
                ...x,
                type: "organization"
            })),

            ...colleges.map(x => ({
                ...x,
                type: "college"
            })),

            ...departments.map(x => ({
                ...x,
                type: "department"
            }))

        ].sort(
            (a, b) =>
                new Date(b.requestedAt) -
                new Date(a.requestedAt)
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

        const { type, id } = req.params;

        let result;

        switch (type) {

            case "organization":

                result =
                    await organizationService.approve(
                        id,
                        req.user.id
                    );

                break;

            case "college":

                result =
                    await collegeService.approve(
                        id,
                        req.user.id
                    );

                break;

            case "department":

                result =
                    await departmentService.approve(
                        id,
                        req.user.id
                    );

                break;

            default:

                return res.status(400).json({

                    success: false,

                    message: "Invalid withdrawal type."

                });

        }

        res.json({

            success: true,

            withdrawal: result

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.reject = async (req, res) => {

    try {

        const { type, id } = req.params;

        let result;

        switch (type) {

            case "organization":

                result =
                    await organizationService.reject(
                        id,
                        req.user.id
                    );

                break;

            case "college":

                result =
                    await collegeService.reject(
                        id,
                        req.user.id
                    );

                break;

            case "department":

                result =
                    await departmentService.reject(
                        id,
                        req.user.id
                    );

                break;

            default:

                return res.status(400).json({

                    success: false,

                    message: "Invalid withdrawal type."

                });

        }

        res.json({

            success: true,

            withdrawal: result

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.request = async (req, res) => {

    try {

        let withdrawal;

        switch (req.user.role) {

            case "ORGANIZATION_ADMIN":

                withdrawal =
                    await organizationService.request({

                        ...req.body,

                        organizationId: req.user.organizationId,

                        requestedBy: req.user.id

                    });

                break;

            case "COLLEGE_ADMIN":

                withdrawal =
                    await collegeService.request({

                        ...req.body,

                        collegeId: req.user.collegeId,

                        requestedBy: req.user.id

                    });

                break;

            case "DEPARTMENT_ADMIN":

                withdrawal =
                    await departmentService.request({

                        ...req.body,

                        departmentId: req.user.departmentId,

                        requestedBy: req.user.id

                    });

                break;

            default:

                return res.status(403).json({

                    success: false,

                    message: "Not allowed."

                });

        }

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

        let withdrawals = [];

        switch (req.user.role) {

            case "SUPER_ADMIN":

                withdrawals = await organizationService.getPending();

                break;

            case "ORGANIZATION_ADMIN":

                withdrawals =
                    await organizationService.getHistory(
                        req.user.organizationId
                    );

                break;

            case "COLLEGE_ADMIN":

                withdrawals =
                    await collegeService.getHistory(
                        req.user.collegeId
                    );

                break;

            case "DEPARTMENT_ADMIN":

                withdrawals =
                    await departmentService.getHistory(
                        req.user.departmentId
                    );

                break;

        }

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