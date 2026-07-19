const organizationService =
require("../services/organizationWithdrawal.service");

const collegeService =
require("../services/collegeWithdrawal.service");

const departmentService =
require("../services/departmentWithdrawal.service");

exports.getAll = async (req, res) => {

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

        console.error(err);

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