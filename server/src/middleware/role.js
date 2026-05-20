const AppError = require('../utils/AppError');

/**
 * Role-based access control middleware.
 * Checks if req.user.role matches the required role(s).
 * @param {...string} roles - Allowed roles (e.g., 'ADMIN')
 */
const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action.', 403);
    }

    next();
  };
};

module.exports = roleMiddleware;
