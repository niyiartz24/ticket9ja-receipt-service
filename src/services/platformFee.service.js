const prisma = require("../config/prisma");


exports.get = async () => {

    let fee = await prisma.platformFee.findFirst();


    if (!fee) {

        fee = await prisma.platformFee.create({

            data: {

                percentage: 1.5,

                flat: 50,

                cap: null

            }

        });

    }


    return fee;

};



exports.update = async (data) => {


    const existing =
        await prisma.platformFee.findFirst();


    if (!existing) {

        return prisma.platformFee.create({

            data

        });

    }


    return prisma.platformFee.update({

        where: {
            id: existing.id
        },

        data

    });


};