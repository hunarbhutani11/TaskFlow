/**
 * Sends a consistent success response.
 */
const sendSuccess = (res, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    ...data,
  });
};

/**
 * Sends a consistent error response.
 */
const sendError = (res, message = 'Something went wrong', statusCode = 500, details = null) => {
  const response = {
    success: false,
    error: message,
    statusCode,
  };
  if (details) {
    response.details = details;
  }
  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };
