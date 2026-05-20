const AppError = require('../utils/AppError');

/**
 * Validation middleware factory.
 * Takes a Zod schema and validates req.body against it.
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 */
const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        statusCode: 400,
        details,
      });
    }

    req.validatedBody = result.data;
    next();
  };
};

module.exports = validate;
