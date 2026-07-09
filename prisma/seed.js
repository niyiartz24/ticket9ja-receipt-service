const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {

    const organization = await prisma.organization.create({

        data: {

            name: "College of BioSciences",

            shortName: "COLBIOS",

            email: "colbios@funaab.edu.ng"

        }

    });

    await prisma.department.createMany({

        data: [

            {
                name: "Microbiology",
                organizationId: organization.id
            },

            {
                name: "Biochemistry",
                organizationId: organization.id
            },

            {
                name: "Zoology",
                organizationId: organization.id
            },
            {
                name: "Botany",
                organizationId: organization.id
            }

        ]

    });

    await prisma.paymentType.createMany({

        data: [

            {

                title: "SUG Due",

                defaultAmount: 1500,

                organizationId: organization.id

            },

            {

                title: "Departmental Due",

                defaultAmount: 5000,

                organizationId: organization.id

            },

            {

                title: "College Due",

                defaultAmount: 50000,

                organizationId: organization.id

            }

        ]

    });

    await prisma.academicSession.create({

        data: {

            name: "2026/2027",

            active: true

        }

    });

    await prisma.receiptTemplate.create({

        data: {

            organizationId: organization.id,

            footerText: "Powered by Ticket9ja",

            primaryColor: "#0F172A"

        }

    });

    console.log("Database seeded successfully.");
}

main()
.then(async () => {
    await prisma.$disconnect();
})
.catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});