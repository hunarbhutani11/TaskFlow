const { verifyToken } = require('../utils/token');
const AppError = require('../utils/AppError');

/**
 * Authentication middleware.
 * Reads the Authorization header, verifies the JWT, and attaches req.user.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Access denied. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    throw new AppError('Invalid or expired token.', 401);
  }
};

module.exports = authMiddleware;
