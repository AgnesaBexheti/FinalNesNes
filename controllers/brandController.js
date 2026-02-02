const Brand = require('../models/Brand');

// Get all brands
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll({
      order: [['name', 'ASC']]
    });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get brand by ID
exports.getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new brand
exports.createBrand = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Brand name is required' });
    }

    const brand = await Brand.create({ name });
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update brand
exports.updateBrand = async (req, res) => {
  try {
    const { name } = req.body;
    const brand = await Brand.findByPk(req.params.id);

    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    if (name) brand.name = name;
    await brand.save();

    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete brand
exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);

    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    await brand.destroy();
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
