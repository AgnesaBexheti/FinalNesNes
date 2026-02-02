const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Public routes
router.get('/active', discountController.getActiveDiscounts);
router.get('/product/:productId', discountController.getDiscountsByProduct);

// Admin-only routes - Only Admin can manage discounts
router.get('/', authenticateToken, requireRole('admin'), discountController.getAllDiscounts);
router.get('/:id', authenticateToken, requireRole('admin'), discountController.getDiscountById);
router.post('/', authenticateToken, requireRole('admin'), discountController.createDiscount);
router.put('/:id', authenticateToken, requireRole('admin'), discountController.updateDiscount);
router.patch('/:id/activate', authenticateToken, requireRole('admin'), discountController.activateDiscount);
router.patch('/:id/deactivate', authenticateToken, requireRole('admin'), discountController.deactivateDiscount);
router.delete('/:id', authenticateToken, requireRole('admin'), discountController.deleteDiscount);

module.exports = router;
