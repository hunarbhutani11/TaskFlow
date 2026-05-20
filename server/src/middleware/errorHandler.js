const logger = require('../utils/logger');

/**
 * Global error handler middleware.
 * Catches all errors thrown in the app and sends a consistent JSON response.
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.message}`, err.stack ? `\n${err.stack}` : '');

  // Prisma known request error
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: 'A record with this value already exists.',
      statusCode: 409,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'Record not found.',
      statusCode: 404,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token.',
      statusCode: 401,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token has expired.',
      statusCode: 401,
    });
  }

  // Operational errors (AppError)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      statusCode: err.statusCode,
    });
  }

  // Unknown errors — don't leak stack trace in production
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';

  return res.status(statusCode).json({
    success: false,
    error: message,
    statusCode,
  });
};

module.exports = errorHandler;
