const Discount = require('../models/Discount');
const Product = require('../models/Product');

// Get all discounts
exports.getAllDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.findAll({
      include: [{
        model: Product,
        attributes: ['id', 'name', 'price']
      }]
    });
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get active discounts
exports.getActiveDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.findAll({
      where: { active: true },
      include: [{
        model: Product,
        attributes: ['id', 'name', 'price']
      }]
    });
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get discount by ID
exports.getDiscountById = async (req, res) => {
  try {
    const discount = await Discount.findByPk(req.params.id, {
      include: [{
        model: Product,
        attributes: ['id', 'name', 'price']
      }]
    });

    if (!discount) {
      return res.status(404).json({ error: 'Discount not found' });
    }

    res.json(discount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get discounts for a specific product
exports.getDiscountsByProduct = async (req, res) => {
  try {
    const discounts = await Discount.findAll({
      where: { productId: req.params.productId },
      include: [{
        model: Product,
        attributes: ['id', 'name', 'price']
      }]
    });
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new discount
exports.createDiscount = async (req, res) => {
  try {
    const { productId, percentage, active } = req.body;

    // Validate required fields
    if (!productId || !percentage) {
      return res.status(400).json({ error: 'Product ID and percentage are required' });
    }

    // Validate percentage range
    if (percentage < 0 || percentage > 100) {
      return res.status(400).json({ error: 'Percentage must be between 0 and 100' });
    }

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const discount = await Discount.create({
      productId,
      percentage,
      active: active !== undefined ? active : true
    });

    res.status(201).json(discount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update discount
exports.updateDiscount = async (req, res) => {
  try {
    const { percentage, active } = req.body;
    const discount = await Discount.findByPk(req.params.id);

    if (!discount) {
      return res.status(404).json({ error: 'Discount not found' });
    }

    // Validate percentage if provided
    if (percentage !== undefined) {
      if (percentage < 0 || percentage > 100) {
        return res.status(400).json({ error: 'Percentage must be between 0 and 100' });
      }
      discount.percentage = percentage;
    }

    if (active !== undefined) {
      discount.active = active;
    }

    await discount.save();
    res.json(discount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete discount
exports.deleteDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByPk(req.params.id);

    if (!discount) {
      return res.status(404).json({ error: 'Discount not found' });
    }

    await discount.destroy();
    res.json({ message: 'Discount deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Activate discount
exports.activateDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByPk(req.params.id);

    if (!discount) {
      return res.status(404).json({ error: 'Discount not found' });
    }

    discount.active = true;
    await discount.save();

    res.json(discount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Deactivate discount
exports.deactivateDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByPk(req.params.id);

    if (!discount) {
      return res.status(404).json({ error: 'Discount not found' });
    }

    discount.active = false;
    await discount.save();

    res.json(discount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
