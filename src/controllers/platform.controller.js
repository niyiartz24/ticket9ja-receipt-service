const service =
require("../services/platform.service");

const prisma = require("../config/prisma");

exports.getPlatformRevenue = async (req, res) => {
  try {
    const days = Number(req.query.days || 30);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await prisma.transaction.findMany({
      where: {
        paymentStatus: "SUCCESSFUL",
        paymentDate: {
          gte: startDate
        }
      },
      include: {
        organization: true
      },
      orderBy: {
        paymentDate: "asc"
      }
    });

    let gross = 0;
    let net = 0;
    let totalPlatformFees = 0;

    const revenueMap = {};
    const orgMap = {};

    transactions.forEach(tx => {
      const grossAmount = Number(tx.grossAmount);
const netAmount = Number(tx.netAmount);
const fee = Number(tx.platformFee);

gross += grossAmount;
net += netAmount;
totalPlatformFees += fee;

const label = tx.paymentDate.toISOString().split("T")[0];

revenueMap[label] =
    (revenueMap[label] || 0) +
    grossAmount;

const orgName = tx.organization.name;

if (!orgMap[orgName]) {
    orgMap[orgName] = 0;
}

orgMap[orgName] += netAmount;
    });

    const labels = Object.keys(revenueMap);

    const data = labels.map(label => revenueMap[label]);

    const topOrgs = Object.entries(orgMap)
      .map(([name, revenue]) => ({
        name,
        revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({
      success: true,

      gross,

      net,

      avgTxn: transactions.length
        ? gross / transactions.length
        : 0,

      platformFees: totalPlatformFees,

      labels,

      data,

      topOrgs
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const feeService =
require("../services/platformFee.service");



exports.fees = async (req,res)=>{

    try {

        const fee =
            await feeService.get();


        res.json({

            success:true,

            percentage:Number(fee.percentage),

            flat:Number(fee.flat),

            cap: fee.cap
                ? Number(fee.cap)
                : null

        });


    } catch(err){

        res.status(500).json({

            success:false,

            message:err.message

        });

    }

};



exports.updateFees = async(req,res)=>{

    try {

        const fee =
            await feeService.update({

                percentage:
                    Number(req.body.percentage),


                flat:
                    Number(req.body.flat),


                cap:
                    req.body.cap
                    ? Number(req.body.cap)
                    : null

            });


        res.json({

            success:true,

            fee

        });


    }catch(err){

        res.status(500).json({

            success:false,

            message:err.message

        });

    }

};

