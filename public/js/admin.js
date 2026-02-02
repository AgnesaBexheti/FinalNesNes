// Admin Dashboard Functionality

// Check if user is logged in
const auth = checkAuth();
if (!auth || !auth.user) {
    alert('Access denied. Please login first.');
    window.location.href = '/pages/login.html';
}

// Check if roleName exists (if not, need to re-login)
if (!auth.user.roleName) {
    alert('Your session is outdated. Please login again to continue.');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/login.html';
}

// Set dashboard title based on role
document.addEventListener('DOMContentLoaded', () => {
    const titleElement = document.getElementById('dashboard-title');
    if (auth.user.roleName === 'admin') {
        titleElement.textContent = 'NesNes - Admin Dashboard';
    } else if (auth.user.roleName === 'advanced') {
        titleElement.textContent = 'NesNes - Advanced User Dashboard';
    } else if (auth.user.roleName === 'simple') {
        titleElement.textContent = 'NesNes - User Dashboard';
    }

    // Hide tabs based on role
    const ordersBtn = document.querySelector('button[onclick="showTab(\'orders\')"]');
    const reportsBtn = document.querySelector('button[onclick="showTab(\'reports\')"]');
    const usersBtn = document.querySelector('button[onclick="showTab(\'users\')"]');

    if (auth.user.roleName === 'simple') {
        // Simple users only see Products and Categories
        if (ordersBtn) ordersBtn.style.display = 'none';
        if (reportsBtn) reportsBtn.style.display = 'none';
        if (usersBtn) usersBtn.style.display = 'none';
    } else if (auth.user.roleName === 'advanced') {
        // Advanced users don't see Users tab
        if (usersBtn) usersBtn.style.display = 'none';
    }
    // Admin sees everything

    loadProducts();
});

// Tab management
function showTab(tabName) {
    document.getElementById('products-tab').style.display = 'none';
    document.getElementById('orders-tab').style.display = 'none';
    document.getElementById('reports-tab').style.display = 'none';
    document.getElementById('users-tab').style.display = 'none';
    document.getElementById('categories-tab').style.display = 'none';

    document.getElementById(tabName + '-tab').style.display = 'block';

    if (tabName === 'products') loadProducts();
    if (tabName === 'orders') loadOrders();
    if (tabName === 'reports') initReports();
    if (tabName === 'users') loadUsers();
    if (tabName === 'categories') loadAllCategories();
}

// ===== PRODUCTS =====

async function loadProducts() {
    const container = document.getElementById('products-table-container');
    container.innerHTML = '<p>Loading...</p>';

    try {
        const response = await fetch(API_ENDPOINTS.PRODUCTS);

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        const products = await response.json();

        let html = '<table><thead><tr><th>ID</th><th>Name</th><th>Price</th><th>Stock</th><th>Category</th><th>Brand</th><th>Actions</th></tr></thead><tbody>';

        products.forEach(product => {
            html += `<tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.initialQuantity}</td>
                <td>${product.Category?.name || '-'}</td>
                <td>${product.Brand?.name || '-'}</td>
                <td>
                    <button class="btn btn-primary" onclick="editProduct(${product.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
                </td>
            </tr>`;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = '<p>Error loading products: ' + error.message + '</p>';
    }
}

async function showAddProductModal() {
    document.getElementById('product-modal-title').textContent = 'Add Product';
    document.getElementById('product-form').reset();
    await loadProductFormOptions();
    document.getElementById('product-modal').style.display = 'block';
}

async function loadProductFormOptions() {
    // Load categories
    const categoriesRes = await fetch(API_ENDPOINTS.CATEGORIES);
    const categories = await categoriesRes.json();
    const categorySelect = document.getElementById('product-category');
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(cat => {
        categorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
    });

    // Load brands
    const brandsRes = await fetch(API_ENDPOINTS.BRANDS);
    const brands = await brandsRes.json();
    const brandSelect = document.getElementById('product-brand');
    brandSelect.innerHTML = '<option value="">Select Brand</option>';
    brands.forEach(brand => {
        brandSelect.innerHTML += `<option value="${brand.id}">${brand.name}</option>`;
    });

    // Load sizes
    const sizesRes = await fetch(API_ENDPOINTS.SIZES);
    const sizes = await sizesRes.json();
    const sizeSelect = document.getElementById('product-size');
    sizeSelect.innerHTML = '<option value="">Select Size</option>';
    sizes.forEach(size => {
        sizeSelect.innerHTML += `<option value="${size.id}">${size.name}</option>`;
    });

    // Load colors
    const colorsRes = await fetch(API_ENDPOINTS.COLORS);
    const colors = await colorsRes.json();
    const colorSelect = document.getElementById('product-color');
    colorSelect.innerHTML = '<option value="">Select Color</option>';
    colors.forEach(color => {
        colorSelect.innerHTML += `<option value="${color.id}">${color.name}</option>`;
    });

    // Load genders
    const gendersRes = await fetch(API_ENDPOINTS.GENDERS);
    const genders = await gendersRes.json();
    const genderSelect = document.getElementById('product-gender');
    genderSelect.innerHTML = '<option value="">Select Gender</option>';
    genders.forEach(gender => {
        genderSelect.innerHTML += `<option value="${gender.id}">${gender.name}</option>`;
    });
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        initialQuantity: parseInt(document.getElementById('product-quantity').value),
        categoryId: parseInt(document.getElementById('product-category').value),
        brandId: parseInt(document.getElementById('product-brand').value),
        sizeId: parseInt(document.getElementById('product-size').value),
        colorId: parseInt(document.getElementById('product-color').value),
        genderId: parseInt(document.getElementById('product-gender').value)
    };

    try {
        const response = await apiCall(API_ENDPOINTS.PRODUCTS, {
            method: 'POST',
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            alert('Product added successfully!');
            closeProductModal();
            loadProducts();
        } else {
            const data = await response.json();
            alert('Error: ' + (data.error || 'Failed to add product'));
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
});

async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;

    try {
        const response = await apiCall(API_ENDPOINTS.PRODUCTS + '/' + id, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Product deleted successfully!');
            loadProducts();
        } else {
            alert('Failed to delete product');
        }
    } catch (error) {
        alert('Network error');
    }
}

// ===== ORDERS =====

async function loadOrders() {
    const statsContainer = document.getElementById('order-stats');
    const container = document.getElementById('orders-table-container');

    statsContainer.innerHTML = '<p>Loading stats...</p>';
    container.innerHTML = '<p>Loading orders...</p>';

    try {
        // Load stats
        const statsRes = await apiCall(API_ENDPOINTS.ORDER_STATS);
        const stats = await statsRes.json();

        statsContainer.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                <div style="background: #3498db; color: white; padding: 1rem; border-radius: 5px;">
                    <h4>Total Orders</h4>
                    <p style="font-size: 2rem; margin: 0;">${stats.total}</p>
                </div>
                <div style="background: #f39c12; color: white; padding: 1rem; border-radius: 5px;">
                    <h4>Pending</h4>
                    <p style="font-size: 2rem; margin: 0;">${stats.pending || 0}</p>
                </div>
                <div style="background: #9b59b6; color: white; padding: 1rem; border-radius: 5px;">
                    <h4>Processing</h4>
                    <p style="font-size: 2rem; margin: 0;">${stats.processing || 0}</p>
                </div>
                <div style="background: #27ae60; color: white; padding: 1rem; border-radius: 5px;">
                    <h4>Delivered</h4>
                    <p style="font-size: 2rem; margin: 0;">${stats.delivered || 0}</p>
                </div>
            </div>
        `;

        // Load orders
        const ordersRes = await apiCall(API_ENDPOINTS.ORDERS);
        const orders = await ordersRes.json();

        let html = '<table><thead><tr><th>ID</th><th>Client</th><th>Email</th><th>Items</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>';

        orders.forEach(order => {
            const itemCount = order.OrderItems?.length || 0;
            const date = new Date(order.createdAt).toLocaleDateString();

            html += `<tr>
                <td>${order.id}</td>
                <td>${order.Client?.fullName || '-'}</td>
                <td>${order.Client?.email || '-'}</td>
                <td>${itemCount}</td>
                <td>${order.status}</td>
                <td>${date}</td>
                <td>
                    <select onchange="updateOrderStatus(${order.id}, this.value)">
                        <option value="">Update Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </td>
            </tr>`;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = '<p>Error loading orders</p>';
    }
}

async function updateOrderStatus(orderId, status) {
    if (!status) return;

    try {
        const response = await apiCall(API_ENDPOINTS.ORDER_STATUS(orderId), {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            alert('Order status updated!');
            loadOrders();
        } else {
            alert('Failed to update status');
        }
    } catch (error) {
        alert('Network error');
    }
}

// ===== REPORTS =====

function initReports() {
    // Initialize month select
    const monthSelect = document.getElementById('month-select');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    monthSelect.innerHTML = '';
    months.forEach((month, index) => {
        monthSelect.innerHTML += `<option value="${index + 1}">${month}</option>`;
    });

    // Initialize year select
    const yearSelect = document.getElementById('year-select');
    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = '';
    for (let year = currentYear; year >= currentYear - 5; year--) {
        yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
    }

    // Set today's date
    document.getElementById('daily-date').valueAsDate = new Date();
}

async function loadDailyEarnings() {
    const date = document.getElementById('daily-date').value;
    const container = document.getElementById('daily-earnings-result');

    container.innerHTML = '<p>Loading...</p>';

    try {
        const response = await apiCall(`${API_ENDPOINTS.DAILY_EARNINGS}?date=${date}`);
        const data = await response.json();

        container.innerHTML = `
            <div style="background: white; padding: 1rem; margin-top: 1rem; border-radius: 5px;">
                <h4>Daily Report - ${data.date}</h4>
                <p><strong>Total Earnings:</strong> $${data.total_earnings}</p>
                <p><strong>Total Orders:</strong> ${data.total_orders}</p>
                <p><strong>Items Sold:</strong> ${data.total_items_sold}</p>
            </div>
        `;
    } catch (error) {
        container.innerHTML = '<p>Error loading report</p>';
    }
}

async function loadMonthlyEarnings() {
    const month = document.getElementById('month-select').value;
    const year = document.getElementById('year-select').value;
    const container = document.getElementById('monthly-earnings-result');

    container.innerHTML = '<p>Loading...</p>';

    try {
        const response = await apiCall(`${API_ENDPOINTS.MONTHLY_EARNINGS}?month=${month}&year=${year}`);
        const data = await response.json();

        container.innerHTML = `
            <div style="background: white; padding: 1rem; margin-top: 1rem; border-radius: 5px;">
                <h4>Monthly Report - ${data.month_name} ${data.year}</h4>
                <p><strong>Total Earnings:</strong> $${data.total_earnings}</p>
                <p><strong>Total Orders:</strong> ${data.total_orders}</p>
                <p><strong>Items Sold:</strong> ${data.total_items_sold}</p>
            </div>
        `;
    } catch (error) {
        container.innerHTML = '<p>Error loading report</p>';
    }
}

async function loadTopSelling() {
    const period = document.getElementById('period-select').value;
    const container = document.getElementById('top-selling-result');

    container.innerHTML = '<p>Loading...</p>';

    try {
        const url = period ? `${API_ENDPOINTS.TOP_SELLING}?period=${period}` : API_ENDPOINTS.TOP_SELLING;
        const response = await apiCall(url);
        const data = await response.json();

        let html = '<table style="margin-top: 1rem;"><thead><tr><th>Rank</th><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr></thead><tbody>';

        data.top_selling_products.forEach(product => {
            html += `<tr>
                <td>${product.rank}</td>
                <td>${product.product_name}</td>
                <td>${product.total_quantity_sold}</td>
                <td>$${product.total_revenue}</td>
            </tr>`;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = '<p>Error loading report</p>';
    }
}

// ===== USERS =====

async function loadUsers() {
    const container = document.getElementById('users-table-container');

    // Check if user is admin
    if (auth.user.roleName !== 'admin') {
        container.innerHTML = '<p style="color: red;">Access Denied: Admin role required to manage users.</p>';
        return;
    }

    container.innerHTML = '<p>Loading users...</p>';

    try {
        const response = await apiCall(API_ENDPOINTS.USERS);
        const users = await response.json();

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        users.forEach(user => {
            html += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.Role?.name || 'No Role'}</td>
                    <td>
                        <select onchange="updateUserRole(${user.id}, this.value)">
                            <option value="">Change Role</option>
                            <option value="1">Admin</option>
                            <option value="2">Advanced User</option>
                            <option value="3">Simple User</option>
                        </select>
                        ${user.id !== auth.user.id ? `<button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">Delete</button>` : ''}
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Error loading users. You may not have permission to access this resource.</p>';
    }
}

async function updateUserRole(userId, roleId) {
    if (!roleId) return;

    if (!confirm('Are you sure you want to change this user\'s role?')) return;

    try {
        const response = await apiCall(`${API_ENDPOINTS.USERS}/${userId}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ roleId: parseInt(roleId) })
        });

        if (response.ok) {
            alert('User role updated successfully!');
            loadUsers();
        } else {
            const data = await response.json();
            alert('Error: ' + (data.error || 'Failed to update role'));
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
        const response = await apiCall(`${API_ENDPOINTS.USERS}/${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('User deleted successfully!');
            loadUsers();
        } else {
            const data = await response.json();
            alert('Error: ' + (data.error || 'Failed to delete user'));
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// ===== CATEGORIES, BRANDS, ETC. =====

async function loadAllCategories() {
    loadCategoryType('categories', API_ENDPOINTS.CATEGORIES);
    loadCategoryType('brands', API_ENDPOINTS.BRANDS);
    loadCategoryType('sizes', API_ENDPOINTS.SIZES);
    loadCategoryType('colors', API_ENDPOINTS.COLORS);
}

async function loadCategoryType(type, endpoint) {
    const container = document.getElementById(type + '-list');
    container.innerHTML = '<p>Loading...</p>';

    try {
        const response = await fetch(endpoint);
        const items = await response.json();

        let html = '<ul style="list-style: none; padding: 0;">';
        items.forEach(item => {
            html += `<li style="padding: 0.5rem; border-bottom: 1px solid #eee;">
                ${item.name}
                ${auth.user.roleName === 'admin' ? `<button class="btn btn-danger" style="float: right; padding: 0.25rem 0.5rem;" onclick="deleteCategory('${type}', ${item.id})">Delete</button>` : ''}
            </li>`;
        });
        html += '</ul>';

        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = '<p>Error loading</p>';
    }
}

function showAddModal(type) {
    const name = prompt(`Enter new ${type} name:`);
    if (!name) return;

    addCategory(type, name);
}

async function addCategory(type, name) {
    const endpoints = {
        category: API_ENDPOINTS.CATEGORIES,
        brand: API_ENDPOINTS.BRANDS,
        size: API_ENDPOINTS.SIZES,
        color: API_ENDPOINTS.COLORS
    };

    try {
        const response = await apiCall(endpoints[type], {
            method: 'POST',
            body: JSON.stringify({ name })
        });

        if (response.ok) {
            alert('Added successfully!');
            loadAllCategories();
        } else {
            alert('Failed to add');
        }
    } catch (error) {
        alert('Network error');
    }
}

async function deleteCategory(type, id) {
    if (!confirm('Delete this item?')) return;

    const endpoints = {
        categories: API_ENDPOINTS.CATEGORIES,
        brands: API_ENDPOINTS.BRANDS,
        sizes: API_ENDPOINTS.SIZES,
        colors: API_ENDPOINTS.COLORS
    };

    try {
        const response = await apiCall(endpoints[type] + '/' + id, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Deleted successfully!');
            loadAllCategories();
        } else {
            alert('Failed to delete');
        }
    } catch (error) {
        alert('Network error');
    }
}

// (Initialization already done at the top of the file)
