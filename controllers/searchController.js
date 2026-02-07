const { Op } = require('sequelize');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Color = require('../models/Color');
const Size = require('../models/Size');
const Gender = require('../models/Gender');
const Discount = require('../models/Discount');
const { searchProducts: esSearch, isConnected: esIsConnected } = require('../config/elasticsearch');

// Advanced product search with multiple filters (Database fallback)
exports.searchProducts = async (req, res) => {
  try {
    const {
      category,
      gender,
      brand,
      price_min,
      price_max,
      size,
      color,
      availability,
      name,
      q // Full-text search query
    } = req.query;

    // Try Elasticsearch first for full-text search
    if (q && await esIsConnected()) {
      try {
        const result = await esSearch(q, {
          category,
          brand,
          color,
          size,
          gender,
          minPrice: price_min,
          maxPrice: price_max
        });

        return res.json({
          source: 'elasticsearch',
          count: result.total,
          query: q,
          filters: { category, gender, brand, price_min, price_max, size, color },
          products: result.products
        });
      } catch (esError) {
        console.error('Elasticsearch search failed, falling back to database:', esError.message);
      }
    }

    // Database search (fallback or for non-text searches)
    const where = {};
    const include = [
      { model: Category, attributes: ['id', 'name'] },
      { model: Brand, attributes: ['id', 'name'] },
      { model: Color, attributes: ['id', 'name'] },
      { model: Size, attributes: ['id', 'name'] },
      { model: Gender, attributes: ['id', 'name'] },
      { model: Discount, where: { active: true }, required: false, attributes: ['id', 'percentage', 'active'] }
    ];

    // Filter by product name or query (partial match)
    if (name || q) {
      where.name = { [Op.iLike]: `%${name || q}%` };
    }

    // Filter by price range
    if (price_min || price_max) {
      where.price = {};
      if (price_min) where.price[Op.gte] = parseFloat(price_min);
      if (price_max) where.price[Op.lte] = parseFloat(price_max);
    }

    // Filter by availability
    if (availability) {
      if (availability === 'in_stock') {
        where.initialQuantity = { [Op.gt]: 0 };
      } else if (availability === 'out_of_stock') {
        where.initialQuantity = { [Op.lte]: 0 };
      }
    }

    // Filter by category
    if (category) {
      include[0].where = { name: { [Op.iLike]: category } };
      include[0].required = true;
    }

    // Filter by brand
    if (brand) {
      include[1].where = { name: { [Op.iLike]: brand } };
      include[1].required = true;
    }

    // Filter by color
    if (color) {
      include[2].where = { name: { [Op.iLike]: color } };
      include[2].required = true;
    }

    // Filter by size
    if (size) {
      include[3].where = { name: { [Op.iLike]: size } };
      include[3].required = true;
    }

    // Filter by gender
    if (gender) {
      include[4].where = { name: { [Op.iLike]: gender } };
      include[4].required = true;
    }

    const products = await Product.findAll({
      where,
      include,
      order: [['id', 'DESC']]
    });

    res.json({
      source: 'database',
      count: products.length,
      filters: { category, gender, brand, price_min, price_max, size, color, availability, name, q },
      products
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Elasticsearch-only search endpoint
exports.elasticSearch = async (req, res) => {
  try {
    const { q, category, brand, color, size, gender, minPrice, maxPrice, limit } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    const connected = await esIsConnected();
    if (!connected) {
      return res.status(503).json({ error: 'Elasticsearch is not available' });
    }

    const result = await esSearch(q, {
      category,
      brand,
      color,
      size,
      gender,
      minPrice,
      maxPrice,
      limit: parseInt(limit) || 20
    });

    res.json({
      query: q,
      total: result.total,
      products: result.products
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
