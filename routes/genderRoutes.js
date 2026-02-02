const express = require('express');
const router = express.Router();
const genderController = require('../controllers/genderController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Public routes
router.get('/', genderController.getAllGenders);
router.get('/:id', genderController.getGenderById);

// Protected routes - Admin and Advanced users only
router.post('/', authenticateToken, requireRole('admin', 'advanced', 'simple'), genderController.createGender);
router.put('/:id', authenticateToken, requireRole('admin', 'advanced', 'simple'), genderController.updateGender);
router.delete('/:id', authenticateToken, requireRole('admin'), genderController.deleteGender);

module.exports = router;
