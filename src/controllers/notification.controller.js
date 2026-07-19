const service =
require("../services/notification.service");

exports.list = async (req,res)=>{

    try{

        const notifications =
            await service.list(
                req.user,
                req.query.pageSize
            );

        res.json({

            success:true,

            notifications

        });

    }catch(err){

    console.error(err);

    res.status(500).json({

        success:false,

        message:err.message

    });

}

};

exports.markRead = async(req,res)=>{

    await service.markRead(req.params.id);

    res.json({

        success:true

    });

};