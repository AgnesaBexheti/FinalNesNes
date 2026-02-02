const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      field: "client_id",
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "pending",
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      field: "total_price",
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "orders",
    timestamps: false,
  }
);

module.exports = Order;
