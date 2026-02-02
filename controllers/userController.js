const User = require('../models/User');
const Role = require('../models/Role');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'roleId'],
      include: [{
        model: Role,
        attributes: ['id', 'name']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'roleId'],
      include: [{
        model: Role,
        attributes: ['id', 'name']
      }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({ error: 'Role ID is required' });
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if role exists
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    user.roleId = roleId;
    await user.save();

    const updatedUser = await User.findByPk(user.id, {
      attributes: ['id', 'username', 'roleId'],
      include: [{
        model: Role,
        attributes: ['id', 'name']
      }]
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'roleId'],
      include: [{
        model: Role,
        attributes: ['id', 'name']
      }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
