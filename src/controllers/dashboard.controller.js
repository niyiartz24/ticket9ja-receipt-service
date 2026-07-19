const dashboardService = require("../services/dashboard.service");

exports.summary = async (req, res) => {

    try {

        const data =
            await dashboardService.summary();

        res.json({
            success: true,
            data
        });

    } catch (err) {

        res.status(500).json({
            success:false,
            message:err.message
        });

    }

};

exports.revenueSeries = async (req,res)=>{

    try{

        const days =
            Number(req.query.days || 30);

        const data =
            await dashboardService.revenueSeries(days);

        res.json({
            success:true,
            data
        });

    }catch(err){

        res.status(500).json({
            success:false,
            message:err.message
        });

    }

};