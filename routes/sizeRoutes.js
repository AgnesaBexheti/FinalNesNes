const express = require('express');
const router = express.Router();
const sizeController = require('../controllers/sizeController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Public routes
router.get('/', sizeController.getAllSizes);
router.get('/:id', sizeController.getSizeById);

// Protected routes - Admin and Advanced users only
router.post('/', authenticateToken, requireRole('admin', 'advanced', 'simple'), sizeController.createSize);
router.put('/:id', authenticateToken, requireRole('admin', 'advanced', 'simple'), sizeController.updateSize);
router.delete('/:id', authenticateToken, requireRole('admin'), sizeController.deleteSize);

module.exports = router;
