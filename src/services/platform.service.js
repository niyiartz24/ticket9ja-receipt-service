const prisma = require("../config/prisma");

exports.revenue = async (days = 30) => {

    const start = new Date();

    start.setDate(start.getDate() - days);

    const transactions = await prisma.transaction.findMany({

        where: {

            paymentStatus: "SUCCESSFUL",

            paymentDate: {

                gte: start

            }

        },

        orderBy: {

            paymentDate: "asc"

        }

    });

    const series = {};

    for (const tx of transactions) {

        const day =
            tx.paymentDate
                .toISOString()
                .split("T")[0];

        if (!series[day]) {

            series[day] = {

                revenue: 0,

                platformFees: 0

            };

        }

        series[day].revenue += Number(tx.grossAmount);

        series[day].platformFees += Number(tx.platformFee);

    }

    return {

        series: Object.entries(series).map(

            ([date, values]) => ({

                date,

                revenue: Number(
                    values.revenue.toFixed(2)
                ),

                platformFees: Number(
                    values.platformFees.toFixed(2)
                )

            })

        )

    };

};

exports.fees = async () => {

    const result =
        await prisma.transaction.aggregate({

            where: {

                paymentStatus: "SUCCESSFUL"

            },

            _sum: {

                grossAmount: true,

                platformFee: true,

                netAmount: true

            },

            _count: {

                id: true

            }

        });

    return {

        transactions: result._count.id,

        grossRevenue:
            Number(result._sum.grossAmount || 0),

        platformFees:
            Number(result._sum.platformFee || 0),

        merchantRevenue:
            Number(result._sum.netAmount || 0)

    };

};