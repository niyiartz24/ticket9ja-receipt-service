const dashboardService =
    require("../services/organizationDashboard.service");

exports.overview = async (req, res) => {

    try {

        const dashboard =
            await dashboardService.overview(

                req.user.organizationId

            );

        res.json({

            success: true,

            dashboard

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.transactions = async (req, res) => {

    try {

        const transactions =
            await dashboardService.recentTransactions(

                req.user.organizationId

            );

        res.json({

            success: true,

            transactions

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.wallet = async (req, res) => {

    try {

        const wallet =
            await dashboardService.wallet(

                req.user.organizationId

            );

        res.json({

            success: true,

            wallet

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.monthlyRevenue = async (req, res) => {

    try {

        const revenue =
            await dashboardService.monthlyRevenue(

                req.user.organizationId

            );

        res.json({

            success: true,

            revenue

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};