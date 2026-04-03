const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// All user management routes require admin role
router.use(authenticate, authorize('admin'));

// GET /api/users - List all users (paginated)
router.get('/', userController.getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', userController.getUserById);

// PATCH /api/users/:id/role - Update user role
router.patch('/:id/role', userController.updateRole);

// PATCH /api/users/:id/status - Update user status (activate/deactivate)
router.patch('/:id/status', userController.updateStatus);

// DELETE /api/users/:id - Delete a user
router.delete('/:id', userController.deleteUser);

module.exports = router;
