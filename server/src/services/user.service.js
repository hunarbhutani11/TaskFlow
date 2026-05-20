const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get all users (Admin only). Never returns passwordHash.
 */
const getAll = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { name: 'asc' },
  });

  return { users };
};

module.exports = { getAll };
