// API Version 1 Router
// Consolidates all routes under /api/v1 prefix

const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('../authRoutes');
const productRoutes = require('../productRoutes');
const categoryRoutes = require('../categoryRoutes');
const brandRoutes = require('../brandRoutes');
const sizeRoutes = require('../sizeRoutes');
const colorRoutes = require('../colorRoutes');
const genderRoutes = require('../genderRoutes');
const discountRoutes = require('../discountRoutes');
const orderRoutes = require('../orderRoutes');
const searchRoutes = require('../searchRoutes');
const reportRoutes = require('../reportRoutes');
const userRoutes = require('../userRoutes');

// Register all routes under v1
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/sizes', sizeRoutes);
router.use('/colors', colorRoutes);
router.use('/genders', genderRoutes);
router.use('/discounts', discountRoutes);
router.use('/orders', orderRoutes);
router.use('/search', searchRoutes);
router.use('/reports', reportRoutes);
router.use('/users', userRoutes);

// API v1 info endpoint
router.get('/', (req, res) => {
  res.json({
    version: '1.0.0',
    message: 'NesNes WebStore API v1',
    endpoints: {
      auth: '/api/v1/auth',
      products: '/api/v1/products',
      categories: '/api/v1/categories',
      brands: '/api/v1/brands',
      sizes: '/api/v1/sizes',
      colors: '/api/v1/colors',
      genders: '/api/v1/genders',
      discounts: '/api/v1/discounts',
      orders: '/api/v1/orders',
      search: '/api/v1/search',
      reports: '/api/v1/reports',
      users: '/api/v1/users',
    },
    documentation: '/api-docs',
  });
});

module.exports = router;