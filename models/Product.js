const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    initialQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "initial_quantity",
    },
    categoryId: {
      type: DataTypes.INTEGER,
      field: "category_id",
    },
    brandId: {
      type: DataTypes.INTEGER,
      field: "brand_id",
    },
    colorId: {
      type: DataTypes.INTEGER,
      field: "color_id",
    },
    sizeId: {
      type: DataTypes.INTEGER,
      field: "size_id",
    },
    genderId: {
      type: DataTypes.INTEGER,
      field: "gender_id",
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      field: "image_url",
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "products",
    timestamps: false,
  }
);

module.exports = Product;
