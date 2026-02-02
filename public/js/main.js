// Main page functionality

let allProducts = [];
let filters = {};

// Load filter options
async function loadFilterOptions() {
    try {
        // Load genders
        const gendersRes = await fetch(API_ENDPOINTS.GENDERS);
        const genders = await gendersRes.json();
        const genderSelect = document.getElementById('filter-gender');
        genders.forEach(gender => {
            const option = document.createElement('option');
            option.value = gender.name;
            option.textContent = gender.name;
            genderSelect.appendChild(option);
        });

        // Load categories
        const categoriesRes = await fetch(API_ENDPOINTS.CATEGORIES);
        const categories = await categoriesRes.json();
        const categorySelect = document.getElementById('filter-category');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });

        // Load brands
        const brandsRes = await fetch(API_ENDPOINTS.BRANDS);
        const brands = await brandsRes.json();
        const brandSelect = document.getElementById('filter-brand');
        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand.name;
            option.textContent = brand.name;
            brandSelect.appendChild(option);
        });

        // Load sizes
        const sizesRes = await fetch(API_ENDPOINTS.SIZES);
        const sizes = await sizesRes.json();
        const sizeSelect = document.getElementById('filter-size');
        sizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size.name;
            option.textContent = size.name;
            sizeSelect.appendChild(option);
        });

        // Load colors
        const colorsRes = await fetch(API_ENDPOINTS.COLORS);
        const colors = await colorsRes.json();
        const colorSelect = document.getElementById('filter-color');
        colors.forEach(color => {
            const option = document.createElement('option');
            option.value = color.name;
            option.textContent = color.name;
            colorSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading filter options:', error);
    }
}

// Load products
async function loadProducts() {
    const loading = document.getElementById('loading');
    const productsGrid = document.getElementById('products-grid');
    const noProducts = document.getElementById('no-products');

    loading.style.display = 'block';
    productsGrid.innerHTML = '';
    noProducts.style.display = 'none';

    try {
        let url = API_ENDPOINTS.PRODUCTS;
        const params = new URLSearchParams();

        // Check if we should use search endpoint
        const hasFilters = Object.keys(filters).length > 0;

        if (hasFilters) {
            url = API_ENDPOINTS.SEARCH;
            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    params.append(key, filters[key]);
                }
            });
        }

        const response = await fetch(`${url}?${params.toString()}`);
        const data = await response.json();

        allProducts = hasFilters ? data.products : data;

        loading.style.display = 'none';

        if (allProducts.length === 0) {
            noProducts.style.display = 'block';
            return;
        }

        displayProducts(allProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        loading.style.display = 'none';
        noProducts.style.display = 'block';
    }
}

// Display products
function displayProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';

    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const stockStatus = product.initialQuantity > 0 ? 'in-stock' : 'out-of-stock';
    const stockText = product.initialQuantity > 0 ? `In Stock (${product.initialQuantity})` : 'Out of Stock';

    // Check if user is admin or advanced
    const auth = checkAuth();
    const canEdit = auth && (auth.user.roleName === 'admin' || auth.user.roleName === 'advanced');

    card.innerHTML = `
        ${product.imageUrl ? `
        <div class="product-image">
            <img src="${product.imageUrl}" alt="${product.name}" />
        </div>
        ` : ''}
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description || 'No description'}</p>
            <div class="product-details">
                <span class="product-tag">${product.Category?.name || 'Category'}</span>
                <span class="product-tag">${product.Brand?.name || 'Brand'}</span>
                <span class="product-tag">Size: ${product.Size?.name || 'M'}</span>
            </div>
            <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
            <div class="product-stock ${stockStatus}">${stockText}</div>
            <div class="product-actions">
                <button class="btn btn-primary" onclick="addToCart(${product.id})" ${product.initialQuantity <= 0 ? 'disabled' : ''}>
                    Add to Cart
                </button>
                ${canEdit ? `<button class="btn btn-secondary" onclick="editProduct(${product.id})">Edit Details</button>` : ''}
            </div>
        </div>
    `;

    return card;
}

// Add to cart
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        cart.addItem(product);
    }
}

// Edit product
let currentEditProduct = null;

async function editProduct(productId) {
    try {
        // Fetch full product details
        const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${productId}`);
        const product = await response.json();
        currentEditProduct = product;

        // Load filter options for the modal
        await loadEditFormOptions();

        // Populate modal with product data
        document.getElementById('edit-product-name').value = product.name;
        document.getElementById('edit-product-description').value = product.description || '';
        document.getElementById('edit-product-price').value = product.price;
        document.getElementById('edit-product-quantity').value = product.initialQuantity;
        document.getElementById('edit-product-category').value = product.categoryId;
        document.getElementById('edit-product-brand').value = product.brandId;
        document.getElementById('edit-product-size').value = product.sizeId;
        document.getElementById('edit-product-color').value = product.colorId;
        document.getElementById('edit-product-gender').value = product.genderId;
        document.getElementById('edit-product-image').value = product.imageUrl || '';

        // Show modal
        document.getElementById('edit-product-modal').style.display = 'block';
    } catch (error) {
        alert('Error loading product details');
    }
}

async function loadEditFormOptions() {
    // Load categories
    const categoriesRes = await fetch(API_ENDPOINTS.CATEGORIES);
    const categories = await categoriesRes.json();
    const categorySelect = document.getElementById('edit-product-category');
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(cat => {
        categorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
    });

    // Load brands
    const brandsRes = await fetch(API_ENDPOINTS.BRANDS);
    const brands = await brandsRes.json();
    const brandSelect = document.getElementById('edit-product-brand');
    brandSelect.innerHTML = '<option value="">Select Brand</option>';
    brands.forEach(brand => {
        brandSelect.innerHTML += `<option value="${brand.id}">${brand.name}</option>`;
    });

    // Load sizes
    const sizesRes = await fetch(API_ENDPOINTS.SIZES);
    const sizes = await sizesRes.json();
    const sizeSelect = document.getElementById('edit-product-size');
    sizeSelect.innerHTML = '<option value="">Select Size</option>';
    sizes.forEach(size => {
        sizeSelect.innerHTML += `<option value="${size.id}">${size.name}</option>`;
    });

    // Load colors
    const colorsRes = await fetch(API_ENDPOINTS.COLORS);
    const colors = await colorsRes.json();
    const colorSelect = document.getElementById('edit-product-color');
    colorSelect.innerHTML = '<option value="">Select Color</option>';
    colors.forEach(color => {
        colorSelect.innerHTML += `<option value="${color.id}">${color.name}</option>`;
    });

    // Load genders
    const gendersRes = await fetch(API_ENDPOINTS.GENDERS);
    const genders = await gendersRes.json();
    const genderSelect = document.getElementById('edit-product-gender');
    genderSelect.innerHTML = '<option value="">Select Gender</option>';
    genders.forEach(gender => {
        genderSelect.innerHTML += `<option value="${gender.id}">${gender.name}</option>`;
    });
}

function closeEditModal() {
    document.getElementById('edit-product-modal').style.display = 'none';
    currentEditProduct = null;
}

async function saveProductEdit(e) {
    e.preventDefault();

    if (!currentEditProduct) return;

    const productData = {
        name: document.getElementById('edit-product-name').value,
        description: document.getElementById('edit-product-description').value,
        price: parseFloat(document.getElementById('edit-product-price').value),
        initialQuantity: parseInt(document.getElementById('edit-product-quantity').value),
        categoryId: parseInt(document.getElementById('edit-product-category').value),
        brandId: parseInt(document.getElementById('edit-product-brand').value),
        sizeId: parseInt(document.getElementById('edit-product-size').value),
        colorId: parseInt(document.getElementById('edit-product-color').value),
        genderId: parseInt(document.getElementById('edit-product-gender').value),
        imageUrl: document.getElementById('edit-product-image').value
    };

    try {
        const response = await apiCall(`${API_ENDPOINTS.PRODUCTS}/${currentEditProduct.id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            alert('Product updated successfully!');
            closeEditModal();
            loadProducts(); // Reload products to show updates
        } else {
            const data = await response.json();
            alert('Error: ' + (data.error || 'Failed to update product'));
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// Search products
function searchProducts() {
    filters = {};

    const name = document.getElementById('search-name').value;
    const gender = document.getElementById('filter-gender').value;
    const category = document.getElementById('filter-category').value;
    const brand = document.getElementById('filter-brand').value;
    const size = document.getElementById('filter-size').value;
    const color = document.getElementById('filter-color').value;
    const priceMin = document.getElementById('filter-price-min').value;
    const priceMax = document.getElementById('filter-price-max').value;
    const availability = document.getElementById('filter-availability').value;

    if (name) filters.name = name;
    if (gender) filters.gender = gender;
    if (category) filters.category = category;
    if (brand) filters.brand = brand;
    if (size) filters.size = size;
    if (color) filters.color = color;
    if (priceMin) filters.price_min = priceMin;
    if (priceMax) filters.price_max = priceMax;
    if (availability) filters.availability = availability;

    loadProducts();
}

// Clear filters
function clearFilters() {
    document.getElementById('search-name').value = '';
    document.getElementById('filter-gender').value = '';
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-brand').value = '';
    document.getElementById('filter-size').value = '';
    document.getElementById('filter-color').value = '';
    document.getElementById('filter-price-min').value = '';
    document.getElementById('filter-price-max').value = '';
    document.getElementById('filter-availability').value = '';

    filters = {};
    loadProducts();
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadFilterOptions();
    loadProducts();

    // Add event listeners
    document.getElementById('search-btn').addEventListener('click', searchProducts);
    document.getElementById('clear-filters-btn').addEventListener('click', clearFilters);
});
