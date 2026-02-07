const sequelize = require("../config/db");
const Role = require("./Role");
const User = require("./User");
const Category = require("./Category");
const Brand = require("./Brand");
const Color = require("./Color");
const Size = require("./Size");
const Gender = require("./Gender");
const Product = require("./Product");
const Discount = require("./Discount");
const Client = require("./Client");
const Order = require("./Order");
const OrderItem = require("./OrderItem");

// ====== Relationships ======
User.belongsTo(Role, { foreignKey: "roleId" });
Role.hasMany(User, { foreignKey: "roleId" });

Product.belongsTo(Category, { foreignKey: "categoryId" });
Category.hasMany(Product, { foreignKey: "categoryId" });

Product.belongsTo(Brand, { foreignKey: "brandId" });
Brand.hasMany(Product, { foreignKey: "brandId" });

Product.belongsTo(Color, { foreignKey: "colorId" });
Color.hasMany(Product, { foreignKey: "colorId" });

Product.belongsTo(Size, { foreignKey: "sizeId" });
Size.hasMany(Product, { foreignKey: "sizeId" });

Product.belongsTo(Gender, { foreignKey: "genderId" });
Gender.hasMany(Product, { foreignKey: "genderId" });

Discount.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(Discount, { foreignKey: "productId" });

Order.belongsTo(Client);
Client.hasMany(Order);

OrderItem.belongsTo(Order);
Order.hasMany(OrderItem);

OrderItem.belongsTo(Product);
Product.hasMany(OrderItem);

module.exports = {
  sequelize,
  Role,
  User,
  Category,
  Brand,
  Color,
  Size,
  Gender,
  Product,
  Discount,
  Client,
  Order,
  OrderItem
};
