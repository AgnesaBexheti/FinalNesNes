const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search products with filters
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Full-text search query (uses Elasticsearch if available)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *       - in: query
 *         name: price_min
 *         schema:
 *           type: number
 *       - in: query
 *         name: price_max
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/', searchController.searchProducts);

/**
 * @swagger
 * /search/elastic:
 *   get:
 *     summary: Full-text search using Elasticsearch
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query with fuzzy matching
 *     responses:
 *       200:
 *         description: Elasticsearch results with highlights
 *       503:
 *         description: Elasticsearch unavailable
 */
router.get('/elastic', searchController.elasticSearch);

module.exports = router;
