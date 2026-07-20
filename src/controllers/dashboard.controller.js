const dashboardService =
require("../services/dashboard.service");

exports.summary = async (req, res) => {

    try {

        const summary =
            await dashboardService.getSummary(req.user);

        res.json({
            success: true,
            summary
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

exports.revenueSeries = async (req, res) => {

    try {

        const revenue =
            await dashboardService.getRevenueSeries();

        res.json({
            success: true,
            revenue
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};