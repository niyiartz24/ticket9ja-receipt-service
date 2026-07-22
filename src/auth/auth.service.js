const prisma = require('../config/prisma');
const { comparePassword } = require('./password');
const { generateToken } = require('./jwt');

exports.login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
    include: {
      organization: true,
      college: true,
      department: true,
    },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.active) {
    throw new Error('Account has been disabled');
  }

  const validPassword = await comparePassword(password, user.password);

  if (!validPassword) {
    throw new Error('Invalid email or password');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  const token = generateToken(user);

  return {
    token,
    user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,

        role: user.role,

        organizationId: user.organizationId,
        collegeId: user.collegeId,
        departmentId: user.departmentId,

        organization: user.organization,
        college: user.college,
        department: user.department,
    },
};
};