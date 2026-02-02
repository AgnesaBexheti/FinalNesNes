/**
 * WebStore API Test Script
 * Run this script to test all backend APIs
 *
 * Prerequisites:
 * - Server must be running (npm start)
 * - Database must be set up
 *
 * Usage: node test-apis.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let authToken = '';
let testProductId = '';
let testOrderId = '';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(test) {
  log(`✓ ${test}`, 'green');
}

function logError(test, error) {
  log(`✗ ${test}`, 'red');
  log(`  Error: ${error.message}`, 'red');
}

function logSection(section) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`${section}`, 'blue');
  log(`${'='.repeat(60)}`, 'blue');
}

async function testAuth() {
  logSection('TESTING AUTHENTICATION APIS');

  try {
    // Test Registration
    const registerData = {
      username: `testuser_${Date.now()}`,
      password: 'test123',
      roleId: 1 // Admin
    };

    const registerRes = await axios.post(`${BASE_URL}/auth/register`, registerData);
    logSuccess('POST /auth/register - User registration');

    // Test Login
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      username: registerData.username,
      password: registerData.password
    });
    authToken = loginRes.data.token;
    logSuccess('POST /auth/login - User login');
    log(`  Token received: ${authToken.substring(0, 20)}...`, 'yellow');
  } catch (error) {
    logError('Authentication tests', error);
  }
}

async function testCategories() {
  logSection('TESTING CATEGORY APIS');

  try {
    // Get all categories
    const categoriesRes = await axios.get(`${BASE_URL}/categories`);
    logSuccess(`GET /categories - Retrieved ${categoriesRes.data.length} categories`);

    // Create category
    const createRes = await axios.post(
      `${BASE_URL}/categories`,
      { name: `TestCategory_${Date.now()}` },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    logSuccess('POST /categories - Category created');

    // Update category
    await axios.put(
      `${BASE_URL}/categories/${createRes.data.id}`,
      { name: 'UpdatedCategory' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    logSuccess('PUT /categories/:id - Category updated');
  } catch (error) {
    logError('Category tests', error);
  }
}

async function testProducts() {
  logSection('TESTING PRODUCT APIS');

  try {
    // Get all products
    const productsRes = await axios.get(`${BASE_URL}/products`);
    logSuccess(`GET /products - Retrieved ${productsRes.data.length} products`);

    // Create product
    const productData = {
      name: `Test Product ${Date.now()}`,
      description: 'Test product description',
      price: 29.99,
      initialQuantity: 100,
      categoryId: 1,
      brandId: 1,
      colorId: 1,
      sizeId: 1,
      genderId: 1
    };

    const createRes = await axios.post(
      `${BASE_URL}/products`,
      productData,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    testProductId = createRes.data.product.id;
    logSuccess(`POST /products - Product created (ID: ${testProductId})`);

    // Get product by ID
    const productRes = await axios.get(`${BASE_URL}/products/${testProductId}`);
    logSuccess(`GET /products/:id - Retrieved product "${productRes.data.name}"`);

    // Get product quantity
    const quantityRes = await axios.get(`${BASE_URL}/products/${testProductId}/quantity`);
    logSuccess(`GET /products/:id/quantity - Current quantity: ${quantityRes.data.current_quantity}`);

    // Update product
    await axios.put(
      `${BASE_URL}/products/${testProductId}`,
      { price: 39.99 },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    logSuccess('PUT /products/:id - Product updated');
  } catch (error) {
    logError('Product tests', error);
  }
}

async function testSearch() {
  logSection('TESTING ADVANCED SEARCH API');

  try {
    // Test search with multiple filters
    const searchRes = await axios.get(`${BASE_URL}/search`, {
      params: {
        price_min: 10,
        price_max: 100,
        availability: 'in_stock'
      }
    });
    logSuccess(`GET /search - Found ${searchRes.data.count} products matching filters`);
    log(`  Filters applied: ${JSON.stringify(searchRes.data.filters)}`, 'yellow');
  } catch (error) {
    logError('Search tests', error);
  }
}

async function testOrders() {
  logSection('TESTING ORDER APIS');

  try {
    // Create order
    const orderData = {
      client: {
        fullName: 'Test Customer',
        email: `test${Date.now()}@example.com`,
        address: '123 Test Street'
      },
      items: [
        { productId: testProductId || 1, quantity: 2 }
      ]
    };

    const createRes = await axios.post(`${BASE_URL}/orders`, orderData);
    testOrderId = createRes.data.order.id;
    logSuccess(`POST /orders - Order created (ID: ${testOrderId}, Total: $${createRes.data.totalAmount})`);

    // Get all orders
    const ordersRes = await axios.get(
      `${BASE_URL}/orders`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    logSuccess(`GET /orders - Retrieved ${ordersRes.data.length} orders`);

    // Get order by ID
    const orderRes = await axios.get(
      `${BASE_URL}/orders/${testOrderId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    logSuccess(`GET /orders/:id - Order details retrieved`);

    // Update order status
    await axios.patch(
      `${BASE_URL}/orders/${testOrderId}/status`,
      { status: 'processing' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    logSuccess('PATCH /orders/:id/status - Order status updated to "processing"');

    // Get order stats
    const statsRes = await axios.get(
      `${BASE_URL}/orders/stats`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    logSuccess(`GET /orders/stats - Total orders: ${statsRes.data.total}`);
  } catch (error) {
    logError('Order tests', error);
  }
}

async function testReports() {
  logSection('TESTING REPORT APIS');

  try {
    // Daily earnings
    const today = new Date().toISOString().split('T')[0];
    const dailyRes = await axios.get(
      `${BASE_URL}/reports/earnings/daily`,
      {
        params: { date: today },
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    logSuccess(`GET /reports/earnings/daily - Earnings: $${dailyRes.data.total_earnings}`);

    // Monthly earnings
    const monthlyRes = await axios.get(
      `${BASE_URL}/reports/earnings/monthly`,
      {
        params: { year: 2025, month: 1 },
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    logSuccess(`GET /reports/earnings/monthly - Monthly earnings retrieved`);

    // Top selling products
    const topRes = await axios.get(
      `${BASE_URL}/reports/top-selling`,
      {
        params: { limit: 5 },
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    logSuccess(`GET /reports/top-selling - Retrieved top ${topRes.data.top_selling_products.length} products`);

    // Sales summary
    const summaryRes = await axios.get(
      `${BASE_URL}/reports/summary`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    logSuccess(`GET /reports/summary - Total revenue: $${summaryRes.data.total_revenue}`);
  } catch (error) {
    logError('Report tests', error);
  }
}

async function testDiscounts() {
  logSection('TESTING DISCOUNT APIS');

  try {
    // Get active discounts
    const activeRes = await axios.get(`${BASE_URL}/discounts/active`);
    logSuccess(`GET /discounts/active - Retrieved ${activeRes.data.length} active discounts`);

    // Create discount
    const discountData = {
      productId: testProductId || 1,
      percentage: 20,
      active: true
    };

    const createRes = await axios.post(
      `${BASE_URL}/discounts`,
      discountData,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    logSuccess(`POST /discounts - Discount created (${discountData.percentage}% off)`);

    // Deactivate discount
    await axios.patch(
      `${BASE_URL}/discounts/${createRes.data.id}/deactivate`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    logSuccess('PATCH /discounts/:id/deactivate - Discount deactivated');
  } catch (error) {
    logError('Discount tests', error);
  }
}

async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║        WebStore API Comprehensive Test Suite             ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');

  try {
    await testAuth();
    await testCategories();
    await testProducts();
    await testSearch();
    await testOrders();
    await testReports();
    await testDiscounts();

    log('\n╔════════════════════════════════════════════════════════════╗', 'green');
    log('║                   ALL TESTS COMPLETED                     ║', 'green');
    log('╚════════════════════════════════════════════════════════════╝', 'green');
  } catch (error) {
    log('\n╔════════════════════════════════════════════════════════════╗', 'red');
    log('║                  TESTS FAILED                             ║', 'red');
    log('╚════════════════════════════════════════════════════════════╝', 'red');
    console.error(error);
  }
}

// Check if server is running
axios.get(`${BASE_URL}/api`)
  .then(() => {
    log('✓ Server is running', 'green');
    runAllTests();
  })
  .catch(() => {
    log('✗ Server is not running. Please start the server with: npm start', 'red');
    process.exit(1);
  });
