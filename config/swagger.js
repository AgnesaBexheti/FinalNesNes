const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NesNes WebStore API',
      version: '1.0.0',
      description: 'REST API documentation for NesNes WebStore - A clothing and accessories e-commerce platform',
      contact: {
        name: 'API Support',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API Version 1',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /auth/login',
        },
      },
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Nike Air Max 270' },
            description: { type: 'string', example: 'Premium running shoes' },
            price: { type: 'number', format: 'decimal', example: 149.99 },
            initialQuantity: { type: 'integer', example: 50 },
            categoryId: { type: 'integer', example: 1 },
            brandId: { type: 'integer', example: 1 },
            colorId: { type: 'integer', example: 1 },
            sizeId: { type: 'integer', example: 1 },
            genderId: { type: 'integer', example: 1 },
            imageUrl: { type: 'string', example: 'https://example.com/image.jpg' },
          },
        },
        ProductInput: {
          type: 'object',
          required: ['name', 'price', 'initialQuantity'],
          properties: {
            name: { type: 'string', example: 'New Product' },
            description: { type: 'string', example: 'Product description' },
            price: { type: 'number', example: 99.99 },
            initialQuantity: { type: 'integer', example: 100 },
            categoryId: { type: 'integer', example: 1 },
            brandId: { type: 'integer', example: 1 },
            colorId: { type: 'integer', example: 1 },
            sizeId: { type: 'integer', example: 1 },
            genderId: { type: 'integer', example: 1 },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Shoes' },
          },
        },
        Brand: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Nike' },
          },
        },
        Color: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Black' },
          },
        },
        Size: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'M' },
          },
        },
        Gender: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Men' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'admin' },
            roleId: { type: 'integer', example: 1 },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'admin' },
            password: { type: 'string', example: 'admin123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                username: { type: 'string' },
                roleId: { type: 'integer' },
              },
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            status: { type: 'string', example: 'pending' },
            totalAmount: { type: 'number', example: 299.99 },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Error message' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Products', description: 'Product management' },
      { name: 'Categories', description: 'Product categories' },
      { name: 'Brands', description: 'Product brands' },
      { name: 'Colors', description: 'Product colors' },
      { name: 'Sizes', description: 'Product sizes' },
      { name: 'Genders', description: 'Target genders' },
      { name: 'Orders', description: 'Order management' },
      { name: 'Users', description: 'User management' },
      { name: 'Search', description: 'Search functionality' },
      { name: 'Reports', description: 'Business reports' },
    ],
  },
  apis: ['./routes/*.js', './routes/**/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;