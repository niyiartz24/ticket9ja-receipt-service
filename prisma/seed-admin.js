const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Admin@123', 12);

  await prisma.user.upsert({
    where: {
      email: 'admin@ticket9japay.com',
    },
    update: {},
    create: {
      fullName: 'Ticket9jaPay Super Admin',
      email: 'admin@ticket9japay.com',
      password,
      role: UserRole.SUPER_ADMIN,
    },
  });

  console.log('Super admin created');
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });