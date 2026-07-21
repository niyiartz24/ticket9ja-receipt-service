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
      const amount = Number(tx.amount);
      const fee = Number(tx.platformFee);

      gross += amount;
      net += amount - fee;
      totalPlatformFees += fee;

      const label = tx.paymentDate.toISOString().split("T")[0];

      revenueMap[label] = (revenueMap[label] || 0) + amount;

      const orgName = tx.organization.name;

      if (!orgMap[orgName]) {
        orgMap[orgName] = 0;
      }

      orgMap[orgName] += amount;
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

exports.fees = async (req, res) => {
    try {
        const result = await service.fees();

        res.json({
            success: true,
            ...result
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};