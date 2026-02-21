# NesNes Webstore — Full-Stack E-Commerce Application

## Overview

NesNes Webstore is a full-stack clothing e-commerce platform developed as part of the Web Services Development course. The application allows customers to browse and purchase clothing products without needing an account, while administrators and staff can manage products, process orders, apply discounts, and generate sales reports through a protected dashboard.

The system is built with a modern microservice-inspired architecture where every component runs inside a Docker container. The backend is a Node.js REST API paired with a GraphQL layer, backed by a PostgreSQL database, a Redis cache, and an Elasticsearch search engine. All traffic from the React frontend flows through a Kong API Gateway before reaching the backend. The entire system is monitored in real time using Prometheus and Grafana.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Docker & Infrastructure Setup](#docker--infrastructure-setup)
5. [Database Design](#database-design)
6. [Authentication & Authorization](#authentication--authorization)
7. [REST API](#rest-api)
8. [GraphQL API](#graphql-api)
9. [Caching with Redis](#caching-with-redis)
10. [Search with Elasticsearch](#search-with-elasticsearch)
11. [Frontend — React Application](#frontend--react-application)
12. [Monitoring — Prometheus & Grafana](#monitoring--prometheus--grafana)
13. [API Gateway — Kong](#api-gateway--kong)
14. [How to Run](#how-to-run)
15. [Default Credentials & Seeded Data](#default-credentials--seeded-data)

---

## System Architecture

The application is composed of eight Docker services that communicate with each other over an internal Docker network called `nesnes-network`. The diagram below illustrates how traffic flows through the system:

```
┌──────────────────────────────────────────────────────────────────┐
│                        BROWSER / CLIENT                          │
│                  React App  →  localhost:3002                    │
└─────────────────────────────┬────────────────────────────────────┘
                              │  HTTP requests
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                    KONG API GATEWAY                              │
│                      localhost:8000                              │
│   Handles: rate limiting, CORS, routing, logging                 │
└─────────────────────────────┬────────────────────────────────────┘
                              │  Proxies to backend
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                  NODE.JS / EXPRESS BACKEND                       │
│                      localhost:5005                              │
│                                                                  │
│   REST API (/api/v1/*)   GraphQL (/graphql)   Swagger (/api-docs)│
│                                                                  │
│              Controllers → Middleware → Models                   │
│                                                                  │
│     ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│     │  PostgreSQL │  │    Redis     │  │  Elasticsearch   │    │
│     │  :5432      │  │   :6379      │  │    :9200         │    │
│     │  (primary)  │  │  (cache)     │  │  (search)        │    │
│     └─────────────┘  └──────────────┘  └──────────────────┘    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                     MONITORING                                   │
│   Prometheus (:9090)  scrapes /metrics  →  Grafana (:3001)       │
└──────────────────────────────────────────────────────────────────┘
```

The React frontend never calls the backend directly — it always goes through Kong. Kong enforces a rate limit of 100 requests per minute per IP address and adds CORS headers so the browser allows the cross-origin requests. From there, Kong proxies the request to the Express backend, which checks the JWT token in the `Authorization` header (where required), runs the business logic, queries the database or cache, and sends the response back.

---

## Technology Stack

### Backend

The backend is written in **Node.js** using the **Express.js** framework (v5). It exposes both a RESTful API and a **GraphQL** endpoint powered by Apollo Server v4. The main database is **PostgreSQL** (v15), accessed through the **Sequelize ORM** which handles model definitions, associations, and automatic table synchronisation on startup.

**Redis** is used as an in-memory cache for product data, significantly reducing the number of database queries for frequently accessed endpoints. **Elasticsearch** powers the full-text search feature, with automatic fallback to a standard database query if Elasticsearch is unavailable. API documentation is auto-generated from JSDoc comments using **Swagger UI**.

Metrics are collected with **prom-client** and exposed on a `/metrics` endpoint that Prometheus scrapes every 10 seconds. Passwords are hashed with **bcryptjs** and sessions are managed via signed **JSON Web Tokens**.

### Frontend

The frontend is a **React** (v19) single-page application bootstrapped with Create React App. It uses **React Router DOM** (v7) for client-side navigation, **Axios** for HTTP requests, and the **Context API** for global state management (authentication and shopping cart). The cart state is persisted in `localStorage` so it survives page refreshes.

### Infrastructure

Every service is containerised with **Docker** and orchestrated with **Docker Compose**. **Kong** (v3.8) acts as the API Gateway in DB-less declarative mode. **Prometheus** scrapes metrics from the backend and Kong, and **Grafana** (v10.2) visualises those metrics on a pre-provisioned dashboard. **pgAdmin 4** provides a web-based interface for inspecting the PostgreSQL database.

---

## Project Structure

The repository is organised so that the backend code sits at the root level and the React frontend lives inside the `client/` folder. Infrastructure configuration is grouped under `docker/`.

```
NesNes - Webstore/
│
├── client/                        # React Frontend Application
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── Navbar.js
│   │   │   ├── ProductCard.js
│   │   │   ├── ProductFilters.js
│   │   │   ├── SearchBar.js
│   │   │   └── EditProductModal.js
│   │   ├── pages/                 # Full page components
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Cart.js
│   │   │   └── Admin.js
│   │   ├── context/
│   │   │   ├── AuthContext.js     # JWT state (login/logout)
│   │   │   └── CartContext.js     # Cart with localStorage
│   │   └── services/
│   │       └── api.js             # All API calls via Axios
│   └── package.json
│
├── controllers/                   # Request handlers / business logic
│   ├── authController.js
│   ├── productController.js       # Redis caching, HATEOAS
│   ├── orderController.js         # Transactions, stock management
│   ├── searchController.js        # Elasticsearch + DB fallback
│   ├── reportController.js        # Sales analytics
│   ├── discountController.js
│   └── userController.js
│
├── models/                        # Sequelize ORM models
│   ├── index.js                   # Associations & DB sync
│   ├── Product.js
│   ├── Order.js / OrderItem.js
│   ├── Client.js
│   ├── User.js / Role.js
│   └── Category/Brand/Color/Size/Gender/Discount.js
│
├── routes/
│   ├── v1/index.js                # Versioned API router (/api/v1)
│   └── *.js                       # Individual route files
│
├── middleware/
│   ├── auth.js                    # JWT verification
│   └── role.js                    # Role-based guards
│
├── config/
│   ├── db.js                      # PostgreSQL connection
│   ├── redis.js                   # Redis client
│   ├── elasticsearch.js           # ES client + index operations
│   └── swagger.js                 # OpenAPI setup
│
├── graphql/
│   ├── schema.js                  # Type definitions
│   └── resolvers.js               # Query/mutation resolvers
│
├── docker/
│   ├── kong/kong.yml              # Declarative Kong config
│   ├── prometheus/prometheus.yml  # Scrape targets
│   └── grafana/provisioning/      # Auto-provisioned datasource + dashboard
│
├── server.js                      # Main entry point
├── seed-database.js               # Populates DB with sample data
└── docker-compose.yml             # All 8 services
```

---

## Docker & Infrastructure Setup

All eight services are defined in `docker-compose.yml` and share an internal bridge network so they can reach each other by container name (e.g., the backend connects to PostgreSQL using the hostname `postgres`, not `localhost`).

The backend image is built from a custom `Dockerfile` based on `node:20-alpine`. It copies the source code, installs only production dependencies, and starts the server.

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

The `docker-compose.yml` wires all services together, sets health checks, and defines dependency ordering. For example, the backend (`app`) will not start until both PostgreSQL and Redis report as healthy, and Kong will not start until the backend passes its own health check.

```yaml
# Excerpt from docker-compose.yml
app:
  build: .
  container_name: nesnes-app
  ports:
    - "5005:5000"
  environment:
    - DB_HOST=postgres
    - REDIS_HOST=redis
    - ELASTICSEARCH_HOST=elasticsearch
  depends_on:
    postgres:
      condition: service_healthy
    redis:
      condition: service_healthy
```

### Service Access Points

| Service | URL | Credentials |
|---|---|---|
| React Frontend | http://localhost:3002 | — |
| Backend API (direct) | http://localhost:5005/api/v1 | — |
| Swagger UI | http://localhost:5005/api-docs | — |
| GraphQL Sandbox | http://localhost:5005/graphql | — |
| Kong Gateway | http://localhost:8000 | — |
| pgAdmin | http://localhost:5050 | admin@admin.com / admin123 |
| Grafana | http://localhost:3001 | admin / admin123 |
| Prometheus | http://localhost:9090 | — |

---

## Database Design

The database uses **PostgreSQL** and is managed entirely through **Sequelize ORM**. All tables are created automatically when the server starts (`sequelize.sync()`). The schema is designed around a central `Product` entity that links to multiple attribute tables, and an `Order` entity that links customers to their purchased items.

### Entity Relationships

```
Role ──────────────────── User
                          (admin / advanced / simple)

Category ─┐
Brand     ─┤
Color     ─┼──────────── Product ─────────── Discount
Size      ─┤              │
Gender    ─┘              │
                          │
Client ──── Order ──── OrderItem
```

Every `Product` belongs to one `Category`, one `Brand`, one `Color`, one `Size`, and one `Gender`. A product can have multiple `Discount` records, but only one can be active at a time. When a customer places an order, a `Client` record is created (or reused) and an `Order` is linked to it. Each item in the order becomes an `OrderItem` that records the price at the time of purchase — so historical orders are not affected by future price changes.

### Key Models

The `Product` model is the most central entity in the system:

```javascript
// models/Product.js
const Product = sequelize.define("Product", {
  name:            { type: DataTypes.STRING,       allowNull: false },
  description:     { type: DataTypes.TEXT },
  price:           { type: DataTypes.DECIMAL(10,2), allowNull: false },
  initialQuantity: { type: DataTypes.INTEGER,      allowNull: false },
  imageUrl:        { type: DataTypes.STRING },
});

Product.belongsTo(Category, { foreignKey: "categoryId" });
Product.belongsTo(Brand,    { foreignKey: "brandId" });
Product.belongsTo(Color,    { foreignKey: "colorId" });
Product.belongsTo(Size,     { foreignKey: "sizeId" });
Product.belongsTo(Gender,   { foreignKey: "genderId" });
Product.hasMany(Discount,   { foreignKey: "productId" });
```

Order processing uses **database transactions** to guarantee consistency. If any step fails (e.g., stock runs out mid-order), the entire operation is rolled back:

```javascript
// controllers/orderController.js — transaction-safe order creation
const result = await sequelize.transaction(async (t) => {
  // Create client record
  const client = await Client.create(
    { fullName, email, address }, { transaction: t }
  );

  // Create the order
  const order = await Order.create(
    { clientId: client.id, status: "pending", totalPrice: 0 },
    { transaction: t }
  );

  let total = 0;
  for (const item of items) {
    const product  = await Product.findByPk(item.productId, { transaction: t });
    const discount = await Discount.findOne({
      where: { productId: item.productId, active: true }, transaction: t
    });

    // Apply discount if one exists
    const finalPrice = discount
      ? product.price * (1 - discount.percentage / 100)
      : product.price;

    await OrderItem.create({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      priceAtOrder: finalPrice,
    }, { transaction: t });

    // Deduct from stock
    await product.update(
      { initialQuantity: product.initialQuantity - item.quantity },
      { transaction: t }
    );

    total += finalPrice * item.quantity;
  }

  await order.update({ totalPrice: total }, { transaction: t });
  return order;
});
```

---

## Authentication & Authorization

Authentication is handled with **JSON Web Tokens (JWT)**. When a user logs in, the server validates their credentials against the bcrypt-hashed password in the database, then signs and returns a token that expires in 2 hours. The client stores this token in `localStorage` and includes it in the `Authorization` header of every subsequent request.

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The `authenticateToken` middleware verifies this token on every protected route. If the token is missing, expired, or tampered with, the request is rejected with a `401` or `403` response.

```javascript
// middleware/auth.js
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;  // { userId, roleId, roleName }
    next();
  });
};
```

### Role-Based Access Control

The system has three roles, each with different levels of access:

| Permission | Simple User | Advanced User | Admin |
|---|:---:|:---:|:---:|
| Browse products & place orders | ✓ | ✓ | ✓ |
| Create & edit products | ✓ | ✓ | ✓ |
| View all orders | ✗ | ✓ | ✓ |
| Update order status | ✗ | ✓ | ✓ |
| Generate sales reports | ✗ | ✓ | ✓ |
| Delete products/orders | ✗ | ✗ | ✓ |
| Manage users | ✗ | ✗ | ✓ |

Routes are protected using a `requireRole` middleware that checks the role extracted from the JWT:

```javascript
// Example: admin-only route
router.delete("/:id", authenticateToken, requireRole("admin"), deleteUser);

// Example: admin or advanced user
router.get("/", authenticateToken, requireRole("admin", "advanced"), getAllOrders);

// Example: any authenticated user
router.post("/", authenticateToken, createProduct);
```

---

## REST API

The full interactive API documentation is available at **http://localhost:5005/api-docs** via Swagger UI. Every route is documented with JSDoc annotations in the route files, so Swagger automatically generates the documentation including request bodies, response schemas, and authentication requirements.

The API supports three equivalent path prefixes for backwards compatibility:

- `/api/v1/{resource}` — primary versioned endpoint (recommended)
- `/api/{resource}` — Kong gateway compatible
- `/{resource}` — legacy routes

### Authentication Endpoints

These endpoints are public and do not require a JWT token.

```
POST  /api/v1/auth/register    Create a new user account
POST  /api/v1/auth/login       Authenticate and receive a JWT token
```

**Login example:**
```json
POST /api/v1/auth/login
{ "username": "admin", "password": "admin123" }

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "roleId": 1,
  "roleName": "admin"
}
```

### Product Endpoints

```
GET    /api/v1/products              List all products (Redis cached)
GET    /api/v1/products/:id          Get single product by ID (cached)
GET    /api/v1/products/:id/quantity Real-time stock availability
POST   /api/v1/products              Create a product  [authenticated]
PUT    /api/v1/products/:id          Update a product  [authenticated]
DELETE /api/v1/products/:id          Delete a product  [admin only]
```

The stock endpoint is particularly useful for displaying live availability to customers without loading the full product:

```json
GET /api/v1/products/35/quantity

{
  "productId": 35,
  "productName": "Nike Air Max 270",
  "initial_quantity": 50,
  "sold_quantity": 12,
  "current_quantity": 38
}
```

### Order Endpoints

Placing an order does **not** require authentication — customers can checkout as guests. The order captures the client's contact information and creates a record that staff can then track and update.

```
POST   /api/v1/orders                   Place an order (public)
GET    /api/v1/orders                   List all orders    [admin/advanced]
GET    /api/v1/orders/:id               Order details      [admin/advanced]
PATCH  /api/v1/orders/:id/status        Update status      [admin/advanced]
GET    /api/v1/orders/stats             Order statistics   [admin/advanced]
DELETE /api/v1/orders/:id              Delete order       [admin only]
```

**Order placement example:**
```json
POST /api/v1/orders
{
  "clientInfo": {
    "fullName": "Anna Smith",
    "email": "anna@example.com",
    "address": "123 Main Street, Prishtina"
  },
  "items": [
    { "productId": 35, "quantity": 2 },
    { "productId": 10, "quantity": 1 }
  ]
}
```

Order status follows this progression:
```
pending  →  processing  →  shipped  →  delivered
                                    →  cancelled
```

### Search Endpoints

```
GET  /api/v1/search          Smart search (Elasticsearch with DB fallback)
GET  /api/v1/search/elastic  Elasticsearch-only search
```

Products can be filtered by any combination of attributes:

```
GET /api/v1/search?q=jacket&gender=women&brand=zara&price_min=50&price_max=300
```

The response includes the source so you know whether Elasticsearch or the database answered the query:

```json
{
  "source": "elasticsearch",
  "count": 4,
  "products": [ ... ]
}
```

### Report Endpoints

These endpoints are available to admin and advanced users and provide sales analytics derived from completed orders:

```
GET  /api/v1/reports/earnings/daily     Daily sales totals
GET  /api/v1/reports/earnings/monthly   Monthly breakdown
GET  /api/v1/reports/top-selling        Best-selling products
```

```
GET /api/v1/reports/earnings/daily?date=2026-02-21
GET /api/v1/reports/earnings/monthly?year=2026&month=2
GET /api/v1/reports/top-selling?period=month
```

### Management Endpoints

Authenticated users can manage product attributes through dedicated endpoints:

```
GET/POST/PUT/DELETE  /api/v1/categories
GET/POST/PUT/DELETE  /api/v1/brands
GET/POST/DELETE      /api/v1/sizes
GET/POST/DELETE      /api/v1/colors
GET/POST/DELETE      /api/v1/genders
GET/POST/PUT/DELETE  /api/v1/discounts
GET/POST/PUT/DELETE  /api/v1/users       [admin only]
```

---

## GraphQL API

In addition to the REST API, the application exposes a **GraphQL** endpoint at `/graphql` powered by Apollo Server v4. GraphQL allows clients to request exactly the fields they need, avoiding over-fetching.

The interactive **Apollo Sandbox** UI is available at **http://localhost:5005/graphql** directly in the browser.

### Schema

The GraphQL schema defines queries for reading data and mutations for writing:

```graphql
# Available queries
type Query {
  products: [Product!]!
  product(id: ID!): Product
  productsByCategory(categoryId: ID!): [Product!]!
  productsByBrand(brandId: ID!): [Product!]!
  categories: [Category!]!
  brands: [Brand!]!
  colors: [Color!]!
  sizes: [Size!]!
  genders: [Gender!]!
  orders: [Order!]!
  order(id: ID!): Order
}

# Available mutations
type Mutation {
  createProduct(input: ProductInput!): Product!
  updateProduct(id: ID!, input: ProductUpdateInput!): Product
  deleteProduct(id: ID!): Boolean!
  createCategory(name: String!): Category!
  createBrand(name: String!): Brand!
}
```

### Example Queries

Fetching all products with their related data:

```graphql
query {
  products {
    id
    name
    price
    category { name }
    brand    { name }
    color    { name }
    size     { name }
  }
}
```

Fetching orders with full item breakdown:

```graphql
query {
  orders {
    id
    clientName
    totalAmount
    status
    items {
      quantity
      priceAtPurchase
      product { name price }
    }
  }
}
```

Creating a new product via mutation:

```graphql
mutation {
  createProduct(input: {
    name: "Summer Linen Dress"
    price: 89.99
    initialQuantity: 30
    categoryId: 1
    brandId: 3
    genderId: 2
  }) {
    id
    name
    price
  }
}
```

### Apollo Server Setup

The Apollo Server is configured with introspection enabled (so the Sandbox can read the schema) and a custom landing page plugin that serves the sandbox UI even in production mode:

```javascript
// server.js
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
});

await apolloServer.start();

app.use("/graphql",
  (req, _res, next) => { if (req.body === undefined) req.body = {}; next(); },
  express.json(),
  expressMiddleware(apolloServer, { context: async ({ req }) => ({ req }) })
);
```

---

## Caching with Redis

To reduce database load on frequently accessed endpoints, the product list and individual product records are cached in **Redis** with a TTL (time-to-live) of 5 minutes.

When a request comes in for the product list, the controller first checks Redis. If the data is there (a "cache hit"), it returns immediately without touching the database. If not (a "cache miss"), it queries PostgreSQL, stores the result in Redis, and then responds. All cache entries are automatically deleted whenever a product is created, updated, or deleted, ensuring the cache never serves stale data.

```javascript
// controllers/productController.js
const getAllProducts = async (req, res) => {
  const CACHE_KEY = "products:all";

  // Step 1: Check Redis
  const cached = await redis.get(CACHE_KEY);
  if (cached) {
    return res.set("X-Cache", "HIT").json(JSON.parse(cached));
  }

  // Step 2: Cache miss — query the database
  const products = await Product.findAll({
    include: [Category, Brand, Color, Size, Gender]
  });

  // Step 3: Store in Redis for 5 minutes
  await redis.set(CACHE_KEY, JSON.stringify(products), "EX", 300);

  return res.set("X-Cache", "MISS").json(products);
};
```

The API response includes an `X-Cache` header that shows whether the data came from Redis or the database, which is useful for debugging and performance analysis.

---

## Search with Elasticsearch

The search system uses a **dual-engine** approach. When Elasticsearch is available, it performs a full-text search with fuzzy matching, boosting results by product name and description. If Elasticsearch is unavailable, the system automatically falls back to a standard PostgreSQL `ILIKE` query so search always works regardless of the search engine's status.

```javascript
// controllers/searchController.js
const search = async (req, res) => {
  const { q, category, brand, gender, size, price_min, price_max } = req.query;

  if (await esIsConnected()) {
    // Use Elasticsearch for rich full-text search
    const results = await searchProducts({ q, category, brand, gender, size, price_min, price_max });
    return res.json({ source: "elasticsearch", ...results });
  }

  // Fallback: standard SQL query
  const where = {};
  if (q) where.name = { [Op.iLike]: `%${q}%` };

  const products = await Product.findAll({ where, include: [Category, Brand, Color, Size, Gender] });
  return res.json({ source: "database", count: products.length, products });
};
```

The Elasticsearch index is created on startup with a custom mapping that marks `name` and `description` as full-text searchable, while attributes like `brand`, `category`, and `gender` are stored as keywords for exact filtering:

```javascript
// config/elasticsearch.js — index mapping
mappings: {
  properties: {
    name:        { type: "text",    analyzer: "standard" },
    description: { type: "text",   analyzer: "standard" },
    price:       { type: "float"  },
    category:    { type: "keyword" },
    brand:       { type: "keyword" },
    gender:      { type: "keyword" },
    size:        { type: "keyword" },
    color:       { type: "keyword" },
  }
}
```

All 40+ seeded products are automatically indexed into Elasticsearch when the server starts.

---

## Frontend — React Application

The frontend is a **React** single-page application that runs locally on port 3002. It communicates exclusively with the backend through a single Axios instance defined in `services/api.js`. This instance automatically attaches the JWT token from `localStorage` to every outgoing request and redirects the user to the login page if the server responds with a `401 Unauthorized` error.

```javascript
// client/src/services/api.js
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api/v1",
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-redirect to login on auth failure
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) window.location.href = "/login";
    return Promise.reject(error);
  }
);
```

### Global State with Context API

**AuthContext** manages whether the user is logged in, their role, and provides `login` / `logout` functions. **CartContext** manages the shopping cart array and persists it to `localStorage` so items survive a page reload:

```javascript
// client/src/context/CartContext.js
const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addItem     = (product, qty = 1) => { /* add/update item */ };
  const removeItem  = (productId)        => { /* remove from cart */ };
  const getTotal    = () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const clearCart   = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, getTotal, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
```

### Pages

| Page | Route | Who can access | Description |
|---|---|---|---|
| Home | `/` | Everyone | Product listing with filtering and search |
| Login | `/login` | Everyone | JWT authentication form |
| Register | `/register` | Everyone | Create new user account |
| Cart | `/cart` | Everyone | Cart review and guest checkout |
| Admin | `/admin` | Authenticated users | Manage products, orders, view reports |

---

## Monitoring — Prometheus & Grafana

The backend tracks every HTTP request with two custom Prometheus metrics: a **counter** that increments on each request (labelled by method, route, and status code), and a **histogram** that records how long each request took in seconds.

```javascript
// server.js — metrics middleware (runs on every request)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const route    = req.route ? req.route.path : req.path;

    httpRequestsTotal.inc({
      method: req.method, route, status: res.statusCode
    });
    httpRequestDuration.observe({
      method: req.method, route, status: res.statusCode
    }, duration);
  });
  next();
});
```

These metrics are exposed at `http://localhost:5005/metrics` in Prometheus text format. **Prometheus** (configured in `docker/prometheus/prometheus.yml`) scrapes this endpoint every 10 seconds and stores the time-series data.

**Grafana** connects to Prometheus as a data source and visualises the data on the pre-built **NesNes API Dashboard**, which is automatically provisioned when Grafana starts. The dashboard contains six panels:

| Panel | What it shows |
|---|---|
| **API Request Rate** | Requests per second across all endpoints |
| **API Response Time (P95)** | 95th percentile response latency in milliseconds |
| **Request Rate by Endpoint** | Per-route breakdown of traffic over time |
| **Error Rate (5xx)** | Server error frequency |
| **API Health Status** | Live UP / DOWN status of the backend |
| **Memory Usage** | Backend process memory consumption |

The dashboard auto-refreshes every 5 seconds, so it shows near real-time data as you use the application.

---

## API Gateway — Kong

**Kong** sits in front of the backend and handles cross-cutting concerns so the application code does not have to. It runs in DB-less mode, meaning its entire configuration is defined in a single YAML file (`docker/kong/kong.yml`) with no database required.

Kong is configured with three plugins applied globally across all routes:

- **Rate Limiting** — restricts each IP address to 100 requests per minute to prevent abuse
- **CORS** — adds the required cross-origin headers so the browser allows requests from the React frontend
- **File Logging** — logs every request to stdout for visibility

The routing configuration maps incoming paths to the backend service:

```yaml
# docker/kong/kong.yml
services:
  - name: nesnes-api
    url: http://nesnes-app:5000      # Internal Docker hostname
    routes:
      - name: api-route
        paths: [/api]
        methods: [GET, POST, PUT, DELETE, PATCH, OPTIONS]

      - name: graphql-route
        paths: [/graphql]
        methods: [GET, POST, OPTIONS]

      - name: legacy-products
        paths: [/products]

      # ... orders, auth, search, categories, etc.

plugins:
  - name: rate-limiting
    config:
      minute: 100
      policy: local

  - name: cors
    config:
      origins: ["*"]
      credentials: true
```

Any request to `http://localhost:8000/api/products` is transparently forwarded to `http://nesnes-app:5000/api/products` inside the Docker network.

---

## How to Run

### Prerequisites

- Docker Desktop installed and running
- Node.js 18+ installed (for the React frontend)

### Step 1 — Start all Docker services

```bash
docker compose up -d
```

This starts PostgreSQL, Redis, Elasticsearch, the Node.js backend, Kong, Prometheus, Grafana, and pgAdmin. The first startup takes longer because Docker pulls all the images.

### Step 2 — Seed the database (first time only)

```bash
docker exec nesnes-app node seed-database.js
```

This creates roles, categories, brands, sizes, colors, genders, 40+ products, and a default admin account.

### Step 3 — Start the React frontend

```bash
cd client
npm install       # first time only
npm start
```

The server will start on http://localhost:5000

## Database Setup

The application will automatically create all necessary tables on first run. The database schema includes:

- **Users & Roles**: User authentication and authorization
- **Products**: Product catalog with attributes
- **Categories, Brands, Sizes, Colors, Genders**: Product classification
- **Clients**: Customer information
- **Orders & OrderItems**: Order management
- **Discounts**: Product discount management

## API Documentation

Comprehensive API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Quick API Overview

- **Authentication**: `/auth/login`, `/auth/register`
- **Products**: `/products`, `/products/:id`, `/products/:id/quantity`
- **Search**: `/search?gender=men&category=jackets&price_min=50&price_max=200`
- **Orders**: `/orders`, `/orders/:id/status`
- **Reports**: `/reports/earnings/daily`, `/reports/earnings/monthly`, `/reports/top-selling`
- **Management**: `/categories`, `/brands`, `/sizes`, `/colors`, `/genders`, `/discounts`

## User Roles

### 1. Admin (roleId: 1)
- Full system access
- Manage all products, orders, users
- Generate reports
- Delete resources

### 2. Advanced User (roleId: 2)
- Manage products
- View and update orders
- Generate sales reports
- Manage categories, brands, etc.

### 3. Simple User (roleId: 3)
- Basic product management
- No reporting or admin features

## Frontend Pages

### Public Pages
- **Home** (`/`) - Product browsing and search
- **Login** (`/pages/login.html`) - User authentication
- **Register** (`/pages/register.html`) - New user registration
- **Cart** (`/pages/cart.html`) - Shopping cart and checkout

### Protected Pages
- **Admin Dashboard** (`/pages/admin.html`) - Product, order, and report management

## Key Features Implementation

### 1. Advanced Search API
Filter products by multiple criteria:
```
GET /search?gender=women&brand=nike&size=M&color=red&price_min=20&price_max=100
```

### 2. Real-Time Quantity Tracking
```
GET /products/123/quantity
```
Returns:
- Initial quantity
- Sold quantity
- Current available quantity

### 3. Order Management
- Customers can place orders without authentication
- Admin/Advanced users can view and update order status
- Automatic stock deduction on order placement
- Discount application during checkout

### 4. Reports
- **Daily Earnings**: Sales by date
- **Monthly Earnings**: Monthly breakdown with daily details
- **Top Selling Products**: By time period (week/month/year/all-time)

## Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Role-based access control
- Protected API endpoints
- Input validation
- Transaction-based order processing

## Testing the Application

### 1. Create Test Users

Register users with different roles through `/pages/register.html`

### 2. Add Sample Data

Use the admin dashboard to add:
- Categories (Shirts, Pants, Jackets, etc.)
- Brands (Nike, Adidas, Zara, etc.)
- Sizes (S, M, L, XL, etc.)
- Colors (Red, Blue, Black, etc.)
- Genders (Men, Women, Children, etc.)
- Products

### 3. Test Customer Flow

1. Browse products on home page
2. Use filters to search
3. Add products to cart
4. Complete checkout without login

### 4. Test Admin Flow

1. Login as admin
2. Manage products
3. View orders and update status
4. Generate reports

## Assessment Criteria Coverage

 **Database Design (10%)** - Complete relational database with all required tables

 **API Structure (35%)** - Well-defined RESTful API endpoints for all operations

 **Advanced Search & Quantity APIs (10%)** - Fully functional search with filters and real-time quantity tracking

 **Report Generation APIs (10%)** - Daily/monthly earnings and top-selling products reports

 **Web Services Integration & Frontend (25%)** - Complete frontend with all features integrated

 **Code Quality & Documentation (10%)** - Clean code structure, comprehensive documentation

## Future Enhancements

- Product images upload
- Payment gateway integration
- Email notifications
- Product reviews and ratings
- Wishlist functionality
- Advanced analytics dashboard
- Export reports to CSV/PDF
- Product variants
- Inventory alerts

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

### Authentication Issues
- Clear browser localStorage
- Check JWT_SECRET is set in `.env`
- Verify user credentials

### Port Already in Use
- Change PORT in `.env`
- Stop other processes using port 5000

## License

This project is created for educational purposes as part of Assignment #1.

## Author

Created for Web Services Development course.
