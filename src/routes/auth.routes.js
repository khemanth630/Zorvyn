const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validate, registerSchema, loginSchema } = require('../middleware/validate');

// POST /api/auth/register - Register a new user
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login - Login user
router.post('/login', validate(loginSchema), authController.login);

// GET /api/auth/me - Get current user profile (authenticated)
router.get('/me', authenticate, authController.getProfile);

module.exports = router;
