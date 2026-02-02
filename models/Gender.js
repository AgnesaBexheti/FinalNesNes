const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Gender = sequelize.define(
  "Gender",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "genders",
    timestamps: false,
  }
);

module.exports = Gender;
