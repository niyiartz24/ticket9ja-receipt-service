const prisma = require("../config/prisma");

exports.summary = async () => {

    const [

        organizations,
        colleges,
        departments,
        users,
        transactions

    ] = await Promise.all([

        prisma.organization.count(),

        prisma.college.count(),

        prisma.department.count(),

        prisma.user.count(),

        prisma.transaction.aggregate({

            where:{
                paymentStatus:"SUCCESSFUL"
            },

            _sum:{
                grossAmount:true
            },

            _count:true

        })

    ]);

    return{

        organizations,

        colleges,

        departments,

        users,

        totalTransactions:
            transactions._count,

        totalRevenue:
            Number(
                transactions._sum.grossAmount || 0
            )

    };

};

exports.revenueSeries = async(days)=>{

    const data =
        await prisma.transaction.findMany({

            where:{
                paymentStatus:"SUCCESSFUL"
            },

            select:{
                grossAmount:true,
                paymentDate:true
            },

            orderBy:{
                paymentDate:"asc"
            }

        });

    return data;

};