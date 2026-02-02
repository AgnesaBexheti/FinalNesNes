const express = require('express');
const router = express.Router();
const colorController = require('../controllers/colorController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Public routes
router.get('/', colorController.getAllColors);
router.get('/:id', colorController.getColorById);

// Protected routes - Admin and Advanced users only
router.post('/', authenticateToken, requireRole('admin', 'advanced', 'simple'), colorController.createColor);
router.put('/:id', authenticateToken, requireRole('admin', 'advanced', 'simple'), colorController.updateColor);
router.delete('/:id', authenticateToken, requireRole('admin'), colorController.deleteColor);

module.exports = router;
