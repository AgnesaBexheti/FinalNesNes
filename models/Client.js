const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Client = sequelize.define(
  "Client",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullName: {
      type: DataTypes.STRING(120),
      allowNull: false,
      field: "full_name",
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "clients",
    timestamps: false,
  }
);

module.exports = Client;
