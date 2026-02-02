const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Role } = require("../models");
require("dotenv").config();

exports.register = async (req, res) => {
  try {
    const { username, password, roleId } = req.body;

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      passwordHash,
      roleId
    });

    res.json({ message: "User registered", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Allow login with either username OR email
    const user = await User.findOne({
      where: email ? { email } : { username },
      include: Role
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.Role.name
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login successful",
      token,
      userId: user.id,
      roleId: user.roleId,
      roleName: user.Role.name
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
