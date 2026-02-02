const { Product, Category, Brand, Color, Size, Gender, Order, OrderItem } = require('../models');

const resolvers = {
  Query: {
    // Products
    products: async () => {
      return await Product.findAll({
        include: [Category, Brand, Color, Size, Gender]
      });
    },

    product: async (_, { id }) => {
      return await Product.findByPk(id, {
        include: [Category, Brand, Color, Size, Gender]
      });
    },

    productsByCategory: async (_, { categoryId }) => {
      return await Product.findAll({
        where: { categoryId },
        include: [Category, Brand, Color, Size, Gender]
      });
    },

    productsByBrand: async (_, { brandId }) => {
      return await Product.findAll({
        where: { brandId },
        include: [Category, Brand, Color, Size, Gender]
      });
    },

    // Categories
    categories: async () => {
      return await Category.findAll();
    },

    category: async (_, { id }) => {
      return await Category.findByPk(id);
    },

    // Brands
    brands: async () => {
      return await Brand.findAll();
    },

    brand: async (_, { id }) => {
      return await Brand.findByPk(id);
    },

    // Colors
    colors: async () => {
      return await Color.findAll();
    },

    // Sizes
    sizes: async () => {
      return await Size.findAll();
    },

    // Genders
    genders: async () => {
      return await Gender.findAll();
    },

    // Orders
    orders: async () => {
      return await Order.findAll({
        include: [{
          model: OrderItem,
          include: [Product]
        }]
      });
    },

    order: async (_, { id }) => {
      return await Order.findByPk(id, {
        include: [{
          model: OrderItem,
          include: [Product]
        }]
      });
    },
  },

  Mutation: {
    // Product mutations
    createProduct: async (_, { input }) => {
      const product = await Product.create(input);
      return await Product.findByPk(product.id, {
        include: [Category, Brand, Color, Size, Gender]
      });
    },

    updateProduct: async (_, { id, input }) => {
      const product = await Product.findByPk(id);
      if (!product) return null;

      await product.update(input);
      return await Product.findByPk(id, {
        include: [Category, Brand, Color, Size, Gender]
      });
    },

    deleteProduct: async (_, { id }) => {
      const product = await Product.findByPk(id);
      if (!product) return false;

      await product.destroy();
      return true;
    },

    // Category mutations
    createCategory: async (_, { name }) => {
      return await Category.create({ name });
    },

    // Brand mutations
    createBrand: async (_, { name }) => {
      return await Brand.create({ name });
    },
  },

  // Field resolvers
  Product: {
    category: async (product) => {
      if (product.Category) return product.Category;
      return await Category.findByPk(product.categoryId);
    },
    brand: async (product) => {
      if (product.Brand) return product.Brand;
      return await Brand.findByPk(product.brandId);
    },
    color: async (product) => {
      if (product.Color) return product.Color;
      return await Color.findByPk(product.colorId);
    },
    size: async (product) => {
      if (product.Size) return product.Size;
      return await Size.findByPk(product.sizeId);
    },
    gender: async (product) => {
      if (product.Gender) return product.Gender;
      return await Gender.findByPk(product.genderId);
    },
  },

  Category: {
    products: async (category) => {
      return await Product.findAll({ where: { categoryId: category.id } });
    },
  },

  Brand: {
    products: async (brand) => {
      return await Product.findAll({ where: { brandId: brand.id } });
    },
  },

  Order: {
    items: async (order) => {
      if (order.OrderItems) return order.OrderItems;
      return await OrderItem.findAll({
        where: { orderId: order.id },
        include: [Product]
      });
    },
  },

  OrderItem: {
    product: async (orderItem) => {
      if (orderItem.Product) return orderItem.Product;
      return await Product.findByPk(orderItem.productId);
    },
  },
};

module.exports = resolvers;