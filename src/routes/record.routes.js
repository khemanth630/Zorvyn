const express = require('express');
const router = express.Router();
const recordController = require('../controllers/record.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate, createRecordSchema, updateRecordSchema } = require('../middleware/validate');

// All record routes require authentication
router.use(authenticate);

// POST /api/records - Create a new record (admin only)
router.post('/', authorize('admin'), validate(createRecordSchema), recordController.createRecord);

// GET /api/records - List all records with filters (all roles)
router.get('/', authorize('admin', 'analyst', 'viewer'), recordController.getAllRecords);

// GET /api/records/:id - Get a single record (all roles)
router.get('/:id', authorize('admin', 'analyst', 'viewer'), recordController.getRecordById);

// PUT /api/records/:id - Update a record (admin only)
router.put('/:id', authorize('admin'), validate(updateRecordSchema), recordController.updateRecord);

// DELETE /api/records/:id - Soft delete a record (admin only)
router.delete('/:id', authorize('admin'), recordController.deleteRecord);

module.exports = router;
