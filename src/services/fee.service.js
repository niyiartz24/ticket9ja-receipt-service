const prisma = require("../config/prisma");


exports.calculate = async(amount)=>{


const feeConfig =
await prisma.platformFee.findFirst();



const percentage =
Number(feeConfig?.percentage || 1.5);


const flat =
Number(feeConfig?.flat || 50);



let fee =
(amount * percentage)/100 + flat;



if(feeConfig?.cap){

    fee =
    Math.min(
        fee,
        Number(feeConfig.cap)
    );

}



return {

amount,

fee,

total:
amount + fee

};


};