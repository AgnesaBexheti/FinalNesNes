const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Brand = sequelize.define(
  "Brand",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "brands",
    timestamps: false,
  }
);

module.exports = Brand;
