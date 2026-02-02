import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with versioned API
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// Product APIs with HATEOAS support
export const productAPI = {
  getAll: (hateoas = false) => api.get('/products', { params: hateoas ? { hateoas: 'true' } : {} }),
  getById: (id, hateoas = false) => api.get(`/products/${id}`, { params: hateoas ? { hateoas: 'true' } : {} }),
  getQuantity: (id) => api.get(`/products/${id}/quantity`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Search API with Elasticsearch support
export const searchAPI = {
  // Regular search (uses ES when available, falls back to DB)
  search: (params) => api.get('/search', { params }),
  // Full-text search with Elasticsearch
  elasticSearch: (query, filters = {}) => api.get('/search/elastic', {
    params: { q: query, ...filters }
  }),
};

// Order APIs
export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  getByClient: (clientId) => api.get(`/orders/client/${clientId}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  getStats: () => api.get('/orders/stats'),
  delete: (id) => api.delete(`/orders/${id}`),
};

// Category APIs
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Brand APIs
export const brandAPI = {
  getAll: () => api.get('/brands'),
  create: (data) => api.post('/brands', data),
  update: (id, data) => api.put(`/brands/${id}`, data),
  delete: (id) => api.delete(`/brands/${id}`),
};

// Size APIs
export const sizeAPI = {
  getAll: () => api.get('/sizes'),
  create: (data) => api.post('/sizes', data),
  delete: (id) => api.delete(`/sizes/${id}`),
};

// Color APIs
export const colorAPI = {
  getAll: () => api.get('/colors'),
  create: (data) => api.post('/colors', data),
  delete: (id) => api.delete(`/colors/${id}`),
};

// Gender APIs
export const genderAPI = {
  getAll: () => api.get('/genders'),
  create: (data) => api.post('/genders', data),
  delete: (id) => api.delete(`/genders/${id}`),
};

// Report APIs
export const reportAPI = {
  getDailyEarnings: (date) => api.get('/reports/earnings/daily', { params: { date } }),
  getMonthlyEarnings: (year, month) => api.get('/reports/earnings/monthly', { params: { year, month } }),
  getTopSelling: (params) => api.get('/reports/top-selling', { params }),
  getSummary: () => api.get('/reports/summary'),
};

// GraphQL endpoint (for advanced use)
export const graphqlAPI = {
  query: (query, variables = {}) =>
    axios.post(`${API_BASE_URL}/graphql`, { query, variables }),
};

export default api;
