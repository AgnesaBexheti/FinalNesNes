# WebStore - Clothing E-Commerce Application

A full-stack web store application for selling clothing products with advanced search, order management, and reporting features.

## Features

### Customer Features
- Browse products with advanced filtering
- Search by category, gender, brand, price, size, color, and availability
- Shopping cart functionality
- Place orders without requiring an account
- Real-time stock availability

### Admin/Advanced User Features
- Product management (CRUD operations)
- Order management and status updates
- Sales reports (daily/monthly earnings, top-selling products)
- Manage categories, brands, sizes, and colors
- Discount management
- User management (Admin only)

### Technical Features
- RESTful API architecture
- JWT-based authentication
- Role-based access control (Admin, Advanced User, Simple User)
- Real-time product quantity tracking
- PostgreSQL database
- Responsive web interface

## Technology Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Responsive design

## Project Structure

```
Assignment/
├── controllers/          # Request handlers
│   ├── authController.js
│   ├── productController.js
│   ├── orderController.js
│   ├── searchController.js
│   ├── reportController.js
│   ├── categoryController.js
│   ├── brandController.js
│   ├── sizeController.js
│   ├── colorController.js
│   ├── genderController.js
│   ├── discountController.js
│   └── userController.js
├── models/              # Database models
│   ├── User.js
│   ├── Role.js
│   ├── Product.js
│   ├── Category.js
│   ├── Brand.js
│   ├── Size.js
│   ├── Color.js
│   ├── Gender.js
│   ├── Client.js
│   ├── Order.js
│   ├── OrderItem.js
│   ├── Discount.js
│   └── index.js
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   ├── searchRoutes.js
│   ├── reportRoutes.js
│   ├── categoryRoutes.js
│   ├── brandRoutes.js
│   ├── sizeRoutes.js
│   ├── colorRoutes.js
│   ├── genderRoutes.js
│   ├── discountRoutes.js
│   └── userRoutes.js
├── middleware/          # Custom middleware
│   ├── auth.js         # JWT authentication
│   └── role.js         # Role-based access control
├── public/             # Frontend files
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── config.js
│   │   ├── auth.js
│   │   ├── cart.js
│   │   ├── main.js
│   │   └── admin.js
│   ├── pages/
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── cart.html
│   │   └── admin.html
│   └── index.html
├── server.js           # Main server file
├── package.json
└── .env               # Environment variables

```

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Assignment
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up PostgreSQL database**

Create a PostgreSQL database named `webstore`:
```sql
CREATE DATABASE webstore;
```

4. **Configure environment variables**

Create a `.env` file in the root directory:
```env
DB_NAME=webstore
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your_secret_key_here
PORT=5000
```

5. **Start the server**
```bash
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



## Author

Created for Web Services Development course.
