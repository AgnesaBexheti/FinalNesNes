const { Product, Category, Brand, Color, Size, Gender, OrderItem, Discount } = require("../models");
const { sequelize } = require("../models");
const { addProductLinks, addProductCollectionLinks } = require("../utils/hateoas");
const { cache } = require("../config/redis");

// Cache keys
const CACHE_KEYS = {
  ALL_PRODUCTS: 'products:all',
  PRODUCT: (id) => `products:${id}`,
};

exports.getAllProducts = async (req, res) => {
  try {
    const wantsHateoas = req.query.hateoas === 'true' ||
                         req.get('Accept')?.includes('application/hal+json');

    // Try to get from cache first
    const cacheKey = CACHE_KEYS.ALL_PRODUCTS;
    let products = await cache.get(cacheKey);

    if (!products) {
      // Cache miss - fetch from database
      products = await Product.findAll({
        include: [
          { model: Category, attributes: ['id', 'name'] },
          { model: Brand, attributes: ['id', 'name'] },
          { model: Color, attributes: ['id', 'name'] },
          { model: Size, attributes: ['id', 'name'] },
          { model: Gender, attributes: ['id', 'name'] },
          { model: Discount, where: { active: true }, required: false, attributes: ['id', 'percentage', 'active'] }
        ]
      });

      // Store in cache for 5 minutes
      await cache.set(cacheKey, products, 300);
      res.set('X-Cache', 'MISS');
    } else {
      res.set('X-Cache', 'HIT');
    }

    if (wantsHateoas) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      res.json(addProductCollectionLinks(products, baseUrl));
    } else {
      res.json(products);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const wantsHateoas = req.query.hateoas === 'true' ||
                         req.get('Accept')?.includes('application/hal+json');

    // Try cache first
    const cacheKey = CACHE_KEYS.PRODUCT(req.params.id);
    let product = await cache.get(cacheKey);

    if (!product) {
      // Cache miss - fetch from database
      product = await Product.findByPk(req.params.id, {
        include: [
          Category, Brand, Color, Size, Gender,
          { model: Discount, where: { active: true }, required: false, attributes: ['id', 'percentage', 'active'] }
        ]
      });

      if (!product) return res.status(404).json({ message: "Product not found" });

      // Store in cache for 5 minutes
      await cache.set(cacheKey, product, 300);
      res.set('X-Cache', 'MISS');
    } else {
      res.set('X-Cache', 'HIT');
    }

    if (wantsHateoas) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      res.json(addProductLinks(product, baseUrl));
    } else {
      res.json(product);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      initialQuantity,
      categoryId,
      brandId,
      colorId,
      sizeId,
      genderId
    } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      initialQuantity,
      categoryId,
      brandId,
      colorId,
      sizeId,
      genderId
    });

    // Invalidate products cache (new product added)
    await cache.del(CACHE_KEYS.ALL_PRODUCTS);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.status(201).json({
      message: "Product created",
      ...addProductLinks(product, baseUrl)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.update(req.body);

    // Invalidate caches (product was updated)
    await cache.del(CACHE_KEYS.PRODUCT(req.params.id));
    await cache.del(CACHE_KEYS.ALL_PRODUCTS);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({
      message: "Product updated",
      ...addProductLinks(product, baseUrl)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.destroy();

    // Invalidate caches (product was deleted)
    await cache.del(CACHE_KEYS.PRODUCT(req.params.id));
    await cache.del(CACHE_KEYS.ALL_PRODUCTS);

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Real-time product quantity tracking
// Returns: initial quantity, sold quantity, and current available quantity
exports.getProductQuantity = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      attributes: ['id', 'name', 'initialQuantity']
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Calculate total sold quantity from order items
    const result = await OrderItem.findOne({
      attributes: [
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('quantity')), 0), 'totalSold']
      ],
      where: { productId: req.params.id }
    });

    const soldQuantity = parseInt(result.dataValues.totalSold) || 0;
    const currentQuantity = product.initialQuantity;

    res.json({
      product_id: product.id,
      name: product.name,
      initial_quantity: currentQuantity,
      sold_quantity: soldQuantity,
      current_quantity: Math.max(0, currentQuantity)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
