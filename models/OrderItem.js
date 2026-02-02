const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      field: "order_id",
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      field: "product_id",
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    priceAtOrder: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "price_at_order",
    },
  },
  {
    tableName: "order_items",
    timestamps: false,
  }
);

module.exports = OrderItem;
