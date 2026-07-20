const prisma = require("../config/prisma");

exports.getSummary = async (user) => {
  const [
    organizations,
    colleges,
    departments,
    users,
    transactions,
    withdrawals,
    wallet
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.college.count(),
    prisma.department.count(),
    prisma.user.count(),
    prisma.transaction.findMany({
      where: {
        status: "SUCCESS"
      }
    }),
    prisma.withdrawal.count(),
    prisma.wallet.findFirst()
  ]);

  const totalRevenue = transactions.reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );

  return {
    organizations,
    colleges,
    departments,
    users,
    withdrawals,
    transactions: transactions.length,
    totalRevenue,
    walletBalance: wallet?.balance || 0
  };
};

exports.getRevenueSeries = async () => {

  const txns = await prisma.transaction.findMany({
    where: {
      status: "SUCCESS"
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  const months = {};

  txns.forEach(tx => {

    const month = tx.createdAt.toLocaleString(
      "en-US",
      {
        month: "short"
      }
    );

    months[month] =
      (months[month] || 0) +
      Number(tx.amount);

  });

  return Object.entries(months).map(([month, amount]) => ({
    month,
    amount
  }));
};