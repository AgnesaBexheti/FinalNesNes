const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Color = sequelize.define(
  "Color",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "colors",
    timestamps: false,
  }
);

module.exports = Color;
