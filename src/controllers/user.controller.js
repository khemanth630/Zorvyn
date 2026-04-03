const userService = require('../services/user.service');

class UserController {
  async getAllUsers(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await userService.getAllUsers({ page, limit });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req, res, next) {
    try {
      const user = await userService.updateRole(req.params.id, req.body.role);
      res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const user = await userService.updateStatus(req.params.id, req.body.status);
      res.status(200).json({
        success: true,
        message: 'User status updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const result = await userService.deleteUser(req.params.id, req.user.id);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
