const ApiError = require('../utils/ApiError');

/**
 * Role-Based Access Control middleware.
 * Accepts one or more allowed roles and denies access if user's role is not included.
 *
 * @param  {...string} allowedRoles - Roles permitted to access the route
 * @returns {Function} Express middleware
 *
 * Usage: authorize('admin', 'analyst')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Role '${req.user.role}' is not authorized to perform this action. Required: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
};

module.exports = { authorize };
