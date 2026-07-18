const dashboardService =
    require("../services/dashboard.service");

exports.overview = async (req, res) => {

    try {

        const dashboard =
            await dashboardService.superDashboard();

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

exports.recentTransactions = async (req, res) => {

    try {

        const transactions =
            await dashboardService.recentTransactions();

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

exports.recentWithdrawals = async (req, res) => {

    try {

        const withdrawals =
            await dashboardService.recentWithdrawals();

        res.json({

            success: true,

            withdrawals

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
            await dashboardService.monthlyRevenue();

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

