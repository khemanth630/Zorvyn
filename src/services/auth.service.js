const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

class AuthService {
  /**
   * Register a new user
   */
  async register({ name, email, password, role }) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw ApiError.conflict('A user with this email already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'viewer',
    });

    const token = this.generateToken(user);

    return {
      user: user.toSafeJSON(),
      token,
    };
  }

  /**
   * Login user with email and password
   */
  async login({ email, password }) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (user.status === 'inactive') {
      throw ApiError.forbidden('Account is deactivated. Contact an administrator.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = this.generateToken(user);

    return {
      user: user.toSafeJSON(),
      token,
    };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user.toSafeJSON();
  }

  /**
   * Generate JWT token
   */
  generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  }
}

module.exports = new AuthService();
