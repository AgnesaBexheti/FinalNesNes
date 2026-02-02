const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All report routes are protected - Admin and Advanced users only (Simple users cannot access)
router.get('/earnings/daily', authenticateToken, requireRole('admin', 'advanced'), reportController.getDailyEarnings);
router.get('/earnings/monthly', authenticateToken, requireRole('admin', 'advanced'), reportController.getMonthlyEarnings);
router.get('/top-selling', authenticateToken, requireRole('admin', 'advanced'), reportController.getTopSellingProducts);
router.get('/summary', authenticateToken, requireRole('admin', 'advanced'), reportController.getSalesSummary);

module.exports = router;
