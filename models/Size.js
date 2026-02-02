const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Size = sequelize.define(
  "Size",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "sizes",
    timestamps: false,
  }
);

module.exports = Size;
