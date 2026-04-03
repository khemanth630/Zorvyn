const ApiError = require('../utils/ApiError');

/**
 * Global error handling middleware.
 * Catches all errors and sends structured JSON responses.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = ApiError.badRequest('Validation failed', messages);
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = ApiError.conflict('Duplicate entry', messages);
  }

  // Handle Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = ApiError.badRequest('Referenced resource does not exist');
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  const response = {
    success: false,
    message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && statusCode === 500 && { stack: err.stack }),
  };

  if (statusCode === 500 && !error.isOperational) {
    console.error('Unhandled Error:', err);
  }

  res.status(statusCode).json(response);
};

module.exports = { errorHandler };
