const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/token');
const AppError = require('../utils/AppError');

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

// Fields to select for user (never return passwordHash)
const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

/**
 * Register a new user.
 */
const signup = async ({ name, email, password, role }) => {
  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role },
    select: userSelect,
  });

  // Generate token
  const token = generateToken(user);

  return { token, user };
};

/**
 * Login an existing user.
 */
const login = async ({ email, password }) => {
  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Generate token
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  };
};

/**
 * Get current authenticated user.
 */
const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return { user };
};

module.exports = { signup, login, getMe };
