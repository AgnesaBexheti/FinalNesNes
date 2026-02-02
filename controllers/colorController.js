const Color = require('../models/Color');

// Get all colors
exports.getAllColors = async (req, res) => {
  try {
    const colors = await Color.findAll({
      order: [['name', 'ASC']]
    });
    res.json(colors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get color by ID
exports.getColorById = async (req, res) => {
  try {
    const color = await Color.findByPk(req.params.id);
    if (!color) {
      return res.status(404).json({ error: 'Color not found' });
    }
    res.json(color);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new color
exports.createColor = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Color name is required' });
    }

    const color = await Color.create({ name });
    res.status(201).json(color);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update color
exports.updateColor = async (req, res) => {
  try {
    const { name } = req.body;
    const color = await Color.findByPk(req.params.id);

    if (!color) {
      return res.status(404).json({ error: 'Color not found' });
    }

    if (name) color.name = name;
    await color.save();

    res.json(color);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete color
exports.deleteColor = async (req, res) => {
  try {
    const color = await Color.findByPk(req.params.id);

    if (!color) {
      return res.status(404).json({ error: 'Color not found' });
    }

    await color.destroy();
    res.json({ message: 'Color deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
