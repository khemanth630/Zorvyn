const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// All dashboard routes require authentication
router.use(authenticate);

// GET /api/dashboard/summary - Financial summary (analyst, admin)
router.get('/summary', authorize('admin', 'analyst'), dashboardController.getSummary);

// GET /api/dashboard/category-summary - Category-wise breakdown (analyst, admin)
router.get('/category-summary', authorize('admin', 'analyst'), dashboardController.getCategorySummary);

// GET /api/dashboard/trends - Monthly trends (analyst, admin)
router.get('/trends', authorize('admin', 'analyst'), dashboardController.getTrends);

// GET /api/dashboard/recent - Recent activity (all roles)
router.get('/recent', authorize('admin', 'analyst', 'viewer'), dashboardController.getRecentActivity);

module.exports = router;
