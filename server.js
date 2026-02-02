const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Swagger documentation
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");

// GraphQL
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const typeDefs = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");

// Prometheus metrics
const promClient = require("prom-client");
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'nesnes_' });

// Custom metrics
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

const { sequelize } = require("./models"); // loads all models + DB connection
const { Product, Category, Brand, Color, Size, Gender } = require("./models");

// Elasticsearch
const { initializeIndex, indexAllProducts, isConnected: esIsConnected } = require("./config/elasticsearch");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Metrics middleware - track all requests
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    httpRequestsTotal.inc({ method: req.method, route: route, status: res.statusCode });
    httpRequestDuration.observe({ method: req.method, route: route, status: res.statusCode }, duration);
  });
  next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
// Import versioned API routes
const apiV1Routes = require("./routes/v1");

// Import individual routes (for backwards compatibility)
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const brandRoutes = require("./routes/brandRoutes");
const sizeRoutes = require("./routes/sizeRoutes");
const colorRoutes = require("./routes/colorRoutes");
const genderRoutes = require("./routes/genderRoutes");
const discountRoutes = require("./routes/discountRoutes");
const orderRoutes = require("./routes/orderRoutes");
const searchRoutes = require("./routes/searchRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");

// ====== VERSIONED API ROUTES ======
// Primary API endpoint - use /api/v1/... for all new integrations
app.use("/api/v1", apiV1Routes);

// ====== LEGACY ROUTES (backwards compatibility) ======
// These routes are deprecated and will be removed in future versions
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/brands", brandRoutes);
app.use("/sizes", sizeRoutes);
app.use("/colors", colorRoutes);
app.use("/genders", genderRoutes);
app.use("/discounts", discountRoutes);
app.use("/orders", orderRoutes);
app.use("/search", searchRoutes);
app.use("/reports", reportRoutes);
app.use("/users", userRoutes);


// ====== SWAGGER DOCUMENTATION ======
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "NesNes WebStore API Documentation"
}));

// ====== API INFO ROUTE ======
app.get("/api", (req, res) => {
  res.json({
    message: "NesNes WebStore API",
    currentVersion: "v1",
    versions: {
      v1: "/api/v1"
    },
    documentation: "/api-docs",
    deprecationNotice: "Direct routes (e.g., /products) are deprecated. Please use /api/v1/products instead."
  });
});

// ====== PROMETHEUS METRICS ENDPOINT ======
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// ====== START SERVER WITH GRAPHQL ======
async function startServer() {
  // Create Apollo Server
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  // Start Apollo Server
  await apolloServer.start();

  // Apply GraphQL middleware
  app.use("/graphql", expressMiddleware(apolloServer, {
    context: async ({ req }) => ({ req }),
  }));

  // Sync database
  try {
    await sequelize.authenticate();
    console.log(" PostgreSQL Connected Successfully!");
    await sequelize.sync();
    console.log(" All Models Synced");

    // Initialize Elasticsearch (async, non-blocking)
    setTimeout(async () => {
      try {
        if (await esIsConnected()) {
          console.log(" Elasticsearch Connected!");
          await initializeIndex();

          // Index all existing products
          const products = await Product.findAll({
            include: [Category, Brand, Color, Size, Gender]
          });
          if (products.length > 0) {
            await indexAllProducts(products);
          }
        } else {
          console.log(" Elasticsearch not available - search will use database");
        }
      } catch (esErr) {
        console.log(" Elasticsearch initialization skipped:", esErr.message);
      }
    }, 5000); // Wait 5 seconds for ES to be ready
  } catch (err) {
    console.error("DB Connection Error:", err);
  }

  // Start Express server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(` Server started on port ${PORT}`);
    console.log(` GraphQL endpoint: http://localhost:${PORT}/graphql`);
    console.log(` REST API docs: http://localhost:${PORT}/api-docs`);
  });
}

startServer();
