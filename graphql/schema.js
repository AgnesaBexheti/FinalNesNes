const typeDefs = `#graphql
  # Product type
  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    initialQuantity: Int!
    imageUrl: String
    category: Category
    brand: Brand
    color: Color
    size: Size
    gender: Gender
  }

  # Category type
  type Category {
    id: ID!
    name: String!
    products: [Product]
  }

  # Brand type
  type Brand {
    id: ID!
    name: String!
    products: [Product]
  }

  # Color type
  type Color {
    id: ID!
    name: String!
  }

  # Size type
  type Size {
    id: ID!
    name: String!
  }

  # Gender type
  type Gender {
    id: ID!
    name: String!
  }

  # Order type
  type Order {
    id: ID!
    clientName: String
    clientEmail: String
    clientPhone: String
    totalAmount: Float
    status: String
    createdAt: String
    items: [OrderItem]
  }

  # OrderItem type
  type OrderItem {
    id: ID!
    quantity: Int!
    priceAtPurchase: Float!
    product: Product
  }

  # Input types for mutations
  input ProductInput {
    name: String!
    description: String
    price: Float!
    initialQuantity: Int!
    categoryId: Int
    brandId: Int
    colorId: Int
    sizeId: Int
    genderId: Int
    imageUrl: String
  }

  input ProductUpdateInput {
    name: String
    description: String
    price: Float
    initialQuantity: Int
    categoryId: Int
    brandId: Int
    colorId: Int
    sizeId: Int
    genderId: Int
    imageUrl: String
  }

  # Queries
  type Query {
    # Products
    products: [Product!]!
    product(id: ID!): Product
    productsByCategory(categoryId: ID!): [Product!]!
    productsByBrand(brandId: ID!): [Product!]!

    # Categories
    categories: [Category!]!
    category(id: ID!): Category

    # Brands
    brands: [Brand!]!
    brand(id: ID!): Brand

    # Colors
    colors: [Color!]!

    # Sizes
    sizes: [Size!]!

    # Genders
    genders: [Gender!]!

    # Orders
    orders: [Order!]!
    order(id: ID!): Order
  }

  # Mutations
  type Mutation {
    # Product mutations
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductUpdateInput!): Product
    deleteProduct(id: ID!): Boolean!

    # Category mutations
    createCategory(name: String!): Category!

    # Brand mutations
    createBrand(name: String!): Brand!
  }
`;

module.exports = typeDefs;