const ApiError = require('../utils/ApiError');

/**
 * Generic validation middleware factory.
 * Validates request body fields against a schema of rules.
 *
 * @param {Object} schema - Object mapping field names to validation rules
 * @returns {Function} Express middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({ field, message: `${field} is required` });
        continue;
      }

      if (value === undefined || value === null) continue;

      if (rules.type === 'number' && (isNaN(Number(value)) || Number(value) <= 0)) {
        errors.push({ field, message: `${field} must be a positive number` });
      }

      if (rules.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push({ field, message: `${field} must be a valid email address` });
        }
      }

      if (rules.enum && !rules.enum.includes(value)) {
        errors.push({ field, message: `${field} must be one of: ${rules.enum.join(', ')}` });
      }

      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        errors.push({ field, message: `${field} must be at least ${rules.minLength} characters` });
      }

      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        errors.push({ field, message: `${field} must be at most ${rules.maxLength} characters` });
      }

      if (rules.type === 'date') {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(value) || isNaN(Date.parse(value))) {
          errors.push({ field, message: `${field} must be a valid date (YYYY-MM-DD)` });
        }
      }
    }

    if (errors.length > 0) {
      return next(ApiError.badRequest('Validation failed', errors));
    }

    next();
  };
};

// ---- Predefined validation schemas ----

const registerSchema = {
  name: { required: true, minLength: 2, maxLength: 100 },
  email: { required: true, type: 'email' },
  password: { required: true, minLength: 6 },
};

const loginSchema = {
  email: { required: true, type: 'email' },
  password: { required: true },
};

const createRecordSchema = {
  amount: { required: true, type: 'number' },
  type: { required: true, enum: ['income', 'expense'] },
  category: { required: true, minLength: 2, maxLength: 50 },
  date: { required: true, type: 'date' },
};

const updateRecordSchema = {
  amount: { type: 'number' },
  type: { enum: ['income', 'expense'] },
  category: { minLength: 2, maxLength: 50 },
  date: { type: 'date' },
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createRecordSchema,
  updateRecordSchema,
};
