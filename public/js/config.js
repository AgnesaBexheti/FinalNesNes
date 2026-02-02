// API Configuration
const API_BASE_URL = 'http://localhost:5000';

const API_ENDPOINTS = {
    // Auth
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,

    // Products
    PRODUCTS: `${API_BASE_URL}/products`,
    PRODUCT_QUANTITY: (id) => `${API_BASE_URL}/products/${id}/quantity`,

    // Search
    SEARCH: `${API_BASE_URL}/search`,

    // Categories, Brands, etc.
    CATEGORIES: `${API_BASE_URL}/categories`,
    BRANDS: `${API_BASE_URL}/brands`,
    SIZES: `${API_BASE_URL}/sizes`,
    COLORS: `${API_BASE_URL}/colors`,
    GENDERS: `${API_BASE_URL}/genders`,

    // Orders
    ORDERS: `${API_BASE_URL}/orders`,
    ORDER_STATUS: (id) => `${API_BASE_URL}/orders/${id}/status`,
    ORDER_STATS: `${API_BASE_URL}/orders/stats`,

    // Reports
    DAILY_EARNINGS: `${API_BASE_URL}/reports/earnings/daily`,
    MONTHLY_EARNINGS: `${API_BASE_URL}/reports/earnings/monthly`,
    TOP_SELLING: `${API_BASE_URL}/reports/top-selling`,
    SALES_SUMMARY: `${API_BASE_URL}/reports/summary`,

    // Users
    USERS: `${API_BASE_URL}/users`,
    USER_PROFILE: `${API_BASE_URL}/users/profile`,

    // Discounts
    DISCOUNTS: `${API_BASE_URL}/discounts`
};

// Helper function to make authenticated API calls
async function apiCall(url, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            // Token expired or invalid
            alert('Session expired. Please login again.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/pages/login.html';
            throw new Error('Authentication required');
        }

        if (response.status === 403) {
            alert('Access denied. You do not have permission for this action.');
            throw new Error('Access denied');
        }

        if (!response.ok && response.status !== 404) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error:', errorData);
        }

        return response;
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
}
