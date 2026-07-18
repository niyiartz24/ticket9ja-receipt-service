const withdrawalService = require("../services/withdrawal.service");

exports.request = async (req, res) => {

    try {

        const withdrawal =
            await withdrawalService.request(req.body);

        return res.status(201).json({

            success: true,

            withdrawal

        });

    } catch (err) {

        return res.status(400).json({

            success: false,

            message: err.message

        });

    }

};

exports.getPending = async (req, res) => {

    try {

        const withdrawals =
            await withdrawalService.getPending();

        return res.json({

            success: true,

            withdrawals

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.getOrganizationHistory = async (req, res) => {

    try {

        const withdrawals =
            await withdrawalService.getOrganizationHistory(
                req.params.organizationId
            );

        return res.json({

            success: true,

            withdrawals

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.approve = async (req, res) => {

    try {

        const withdrawal =
            await withdrawalService.approve(

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
            await withdrawalService.reject(

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

exports.recentTransactions = async () => {

    return prisma.transaction.findMany({

        take: 10,

        orderBy: {

            createdAt: "desc"

        },

        include: {

            organization: true,

            paymentType: true

        }

    });

};

exports.recentWithdrawals = async () => {

    return prisma.withdrawal.findMany({

        take: 10,

        orderBy: {

            requestedAt: "desc"

        },

        include: {

            organization: true

        }

    });

};

exports.monthlyRevenue = async () => {

    const now = new Date();

    const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );

    const transactions =
        await prisma.transaction.findMany({

            where: {

                paymentStatus: "successful",

                paymentDate: {

                    gte: start

                }

            }

        });

    return transactions.reduce(

        (sum, tx) => sum + tx.platformFee,

        0

    );

};

