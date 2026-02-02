const Gender = require('../models/Gender');

// Get all genders
exports.getAllGenders = async (req, res) => {
  try {
    const genders = await Gender.findAll({
      order: [['name', 'ASC']]
    });
    res.json(genders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get gender by ID
exports.getGenderById = async (req, res) => {
  try {
    const gender = await Gender.findByPk(req.params.id);
    if (!gender) {
      return res.status(404).json({ error: 'Gender not found' });
    }
    res.json(gender);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new gender
exports.createGender = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Gender name is required' });
    }

    const gender = await Gender.create({ name });
    res.status(201).json(gender);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update gender
exports.updateGender = async (req, res) => {
  try {
    const { name } = req.body;
    const gender = await Gender.findByPk(req.params.id);

    if (!gender) {
      return res.status(404).json({ error: 'Gender not found' });
    }

    if (name) gender.name = name;
    await gender.save();

    res.json(gender);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete gender
exports.deleteGender = async (req, res) => {
  try {
    const gender = await Gender.findByPk(req.params.id);

    if (!gender) {
      return res.status(404).json({ error: 'Gender not found' });
    }

    await gender.destroy();
    res.json({ message: 'Gender deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
