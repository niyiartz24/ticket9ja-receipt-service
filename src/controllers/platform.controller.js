const service =
require("../services/platform.service");

exports.revenue = async (req,res)=>{

    try{

        const result =
            await service.revenue(
                Number(req.query.days)||30
            );

        res.json({

            success:true,

            ...result

        });

    }catch(err){

        res.status(500).json({

            success:false,

            message:err.message

        });

    }

};

exports.fees = async(req,res)=>{

    try{

        const result =
            await service.fees();

        res.json({

            success:true,

            ...result

        });

    }catch(err){

        res.status(500).json({

            success:false,

            message:err.message

        });

    }

};