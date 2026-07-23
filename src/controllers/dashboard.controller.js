const dashboardService =
require("../services/dashboard.service");

exports.summary = async (req, res) => {

    try {

        const summary = await dashboardService.getSummary(req.user);


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

        const revenueSeries =
            await dashboardService.getRevenueSeries(req.user);

        res.json({
            success: true,
            labels: revenueSeries.labels,
            data: revenueSeries.data,
            split: revenueSeries.split
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};