const { User } = require('../models');
const ApiError = require('../utils/ApiError');

class UserService {
  /**
   * Get all users with pagination
   */
  async getAllUsers({ page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      users: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get single user by ID
   */
  async getUserById(id) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  /**
   * Update user role
   */
  async updateRole(id, role) {
    const validRoles = ['admin', 'analyst', 'viewer'];
    if (!validRoles.includes(role)) {
      throw ApiError.badRequest(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    const user = await User.findByPk(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    user.role = role;
    await user.save();

    return user.toSafeJSON();
  }

  /**
   * Update user status (activate/deactivate)
   */
  async updateStatus(id, status) {
    const validStatuses = ['active', 'inactive'];
    if (!validStatuses.includes(status)) {
      throw ApiError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const user = await User.findByPk(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    user.status = status;
    await user.save();

    return user.toSafeJSON();
  }

  /**
   * Delete user permanently
   */
  async deleteUser(id, requestingUserId) {
    if (id === requestingUserId) {
      throw ApiError.badRequest('You cannot delete your own account');
    }

    const user = await User.findByPk(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    await user.destroy();
    return { message: 'User deleted successfully' };
  }
}

module.exports = new UserService();
