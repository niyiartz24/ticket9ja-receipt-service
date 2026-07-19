const prisma = require("../config/prisma");

exports.organizations = async (req, res) => {

    const organizations =
        await prisma.organization.findMany({

            where: {
                isActive: true
            },

            orderBy: {
                name: "asc"
            }

        });

    res.json({
        success: true,
        organizations
    });

};

exports.colleges = async (req, res) => {

    const colleges =
        await prisma.college.findMany({

            where: {

                organizationId:
                    req.params.organizationId,

                active: true

            },

            orderBy: {
                name: "asc"
            }

        });

    res.json({
        success: true,
        colleges
    });

};

exports.departments = async (req, res) => {

    const departments =
        await prisma.department.findMany({

            where: {

                organizationId:
                    req.params.organizationId,

                isActive: true

            },

            orderBy: {
                name: "asc"
            }

        });

    res.json({

        success: true,

        departments

    });

};

exports.paymentTypes =
async (req, res) => {

    const {

        organizationId,

        collegeId,

        departmentId

    } = req.query;

    const paymentTypes =
        await prisma.paymentType.findMany({

            where: {

                isActive: true,

                organizationId,

                collegeId:
                    collegeId || null,

                departmentId:
                    departmentId || null

            },

            orderBy: {

                title: "asc"

            }

        });

    res.json({

        success: true,

        paymentTypes

    });

};

exports.sessions =
async (req, res) => {

    const sessions =
        await prisma.academicSession.findMany({

            where: {
                active: true
            }

        });

    res.json({

        success: true,

        sessions

    });

};