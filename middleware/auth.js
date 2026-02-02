const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Get user with role information
    const user = await User.findByPk(decoded.id, {
      include: [{
        model: Role,
        attributes: ['id', 'name']
      }]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      username: user.username,
      roleId: user.roleId,
      roleName: user.Role.name
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// Middleware to check if user has required role
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const userRole = req.user.roleName.toLowerCase();
    const hasPermission = allowedRoles.some(role => role.toLowerCase() === userRole);

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Access denied. Insufficient permissions.',
        required: allowedRoles,
        current: req.user.roleName
      });
    }

    next();
  };
};

module.exports = { authenticateToken, requireRole };
