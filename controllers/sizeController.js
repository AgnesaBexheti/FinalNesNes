const Size = require('../models/Size');

// Get all sizes
exports.getAllSizes = async (req, res) => {
  try {
    const sizes = await Size.findAll({
      order: [['name', 'ASC']]
    });
    res.json(sizes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get size by ID
exports.getSizeById = async (req, res) => {
  try {
    const size = await Size.findByPk(req.params.id);
    if (!size) {
      return res.status(404).json({ error: 'Size not found' });
    }
    res.json(size);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new size
exports.createSize = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Size name is required' });
    }

    const size = await Size.create({ name });
    res.status(201).json(size);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update size
exports.updateSize = async (req, res) => {
  try {
    const { name } = req.body;
    const size = await Size.findByPk(req.params.id);

    if (!size) {
      return res.status(404).json({ error: 'Size not found' });
    }

    if (name) size.name = name;
    await size.save();

    res.json(size);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete size
exports.deleteSize = async (req, res) => {
  try {
    const size = await Size.findByPk(req.params.id);

    if (!size) {
      return res.status(404).json({ error: 'Size not found' });
    }

    await size.destroy();
    res.json({ message: 'Size deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
