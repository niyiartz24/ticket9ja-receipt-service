const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {

    // Organization
    const organization = await prisma.organization.upsert({
        where: {
            shortName: "COLBIOS"
        },
        update: {
            name: "College of BioSciences",
            email: "colbios@funaab.edu.ng"
        },
        create: {
            name: "College of BioSciences",
            shortName: "COLBIOS",
            email: "colbios@funaab.edu.ng"
        }
    });

    // Remove old configuration
    await prisma.department.deleteMany({
        where: {
            organizationId: organization.id
        }
    });

    await prisma.paymentType.deleteMany({
        where: {
            organizationId: organization.id
        }
    });

    await prisma.receiptTemplate.deleteMany({
        where: {
            organizationId: organization.id
        }
    });

    // Departments
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

    // Payment Types
    await prisma.paymentType.createMany({
        data: [
            {
                title: "SUG Due",
                defaultAmount: 1500,
                organizationId: organization.id
            },
            {
                title: "Departmental Due",
                defaultAmount: 3500,
                organizationId: organization.id
            },
            {
                title: "College Due",
                defaultAmount: 4000,
                organizationId: organization.id
            }
        ]
    });

    // Academic Session
    await prisma.academicSession.upsert({
        where: {
            name: "2026/2027"
        },
        update: {
            active: true
        },
        create: {
            name: "2026/2027",
            active: true
        }
    });

    // Receipt Template
    await prisma.receiptTemplate.upsert({
        where: {
            organizationId: organization.id
        },
        update: {
            footerText: "Powered by Ticket9ja",
            primaryColor: "#0F172A"
        },
        create: {
            organizationId: organization.id,
            footerText: "Powered by Ticket9ja",
            primaryColor: "#0F172A"
        }
    });

    console.log("✅ Database seeded successfully.");
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