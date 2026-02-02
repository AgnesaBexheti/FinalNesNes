const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Public routes
router.get('/', brandController.getAllBrands);
router.get('/:id', brandController.getBrandById);

// Protected routes - Admin and Advanced users only
router.post('/', authenticateToken, requireRole('admin', 'advanced', 'simple'), brandController.createBrand);
router.put('/:id', authenticateToken, requireRole('admin', 'advanced', 'simple'), brandController.updateBrand);
router.delete('/:id', authenticateToken, requireRole('admin'), brandController.deleteBrand);

module.exports = router;
