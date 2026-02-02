const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get current user profile (any authenticated user)
router.get('/profile', authenticateToken, userController.getProfile);

// Admin-only routes for user management
router.get('/', authenticateToken, requireRole('admin'), userController.getAllUsers);
router.get('/:id', authenticateToken, requireRole('admin'), userController.getUserById);
router.patch('/:id/role', authenticateToken, requireRole('admin'), userController.updateUserRole);
router.delete('/:id', authenticateToken, requireRole('admin'), userController.deleteUser);

module.exports = router;
