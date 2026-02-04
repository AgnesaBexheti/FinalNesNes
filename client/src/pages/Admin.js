import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  productAPI,
  orderAPI,
  categoryAPI,
  brandAPI,
  sizeAPI,
  colorAPI,
  genderAPI,
  reportAPI,
} from '../services/api';

const Admin = () => {
  const { isAdmin, isAdvanced } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [genders, setGenders] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    initialQuantity: '',
    categoryId: '',
    brandId: '',
    colorId: '',
    sizeId: '',
    genderId: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (!isAdmin() && !isAdvanced()) {
      navigate('/');
      return;
    }
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      switch (activeTab) {
        case 'products':
          await loadProducts();
          break;
        case 'orders':
          await loadOrders();
          break;
        case 'categories':
          await loadCategories();
          await loadBrands();
          await loadSizes();
          await loadColors();
          await loadGenders();
          break;
        case 'reports':
          await loadReports();
          break;
        default:
          break;
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    const response = await productAPI.getAll();
    setProducts(response.data);
    const [cats, brds, szs, clrs, gnds] = await Promise.all([
      categoryAPI.getAll(),
      brandAPI.getAll(),
      sizeAPI.getAll(),
      colorAPI.getAll(),
      genderAPI.getAll(),
    ]);
    setCategories(cats.data);
    setBrands(brds.data);
    setSizes(szs.data);
    setColors(clrs.data);
    setGenders(gnds.data);
  };

  const loadOrders = async () => {
    const response = await orderAPI.getAll();
    console.log('Orders from API:', response.data);
    if (response.data.length > 0) {
      console.log('First order details:', {
        id: response.data[0].id,
        totalPrice: response.data[0].totalPrice,
        Client: response.data[0].Client,
        OrderItems: response.data[0].OrderItems
      });
    }
    setOrders(response.data);
  };

  const loadCategories = async () => {
    const response = await categoryAPI.getAll();
    setCategories(response.data);
  };

  const loadBrands = async () => {
    const response = await brandAPI.getAll();
    setBrands(response.data);
  };

  const loadSizes = async () => {
    const response = await sizeAPI.getAll();
    setSizes(response.data);
  };

  const loadColors = async () => {
    const response = await colorAPI.getAll();
    setColors(response.data);
  };

  const loadGenders = async () => {
    const response = await genderAPI.getAll();
    setGenders(response.data);
  };

  // Calculate order total from items if totalPrice is not set
  const calculateOrderTotal = (order) => {
    // Check both camelCase and snake_case for totalPrice
    const totalPrice = order.totalPrice || order.total_price;
    if (totalPrice && parseFloat(totalPrice) > 0) {
      return parseFloat(totalPrice).toFixed(2);
    }
    // Fallback: calculate from order items
    if (order.OrderItems && order.OrderItems.length > 0) {
      const total = order.OrderItems.reduce((sum, item) => {
        // Handle both camelCase and snake_case field names
        const price = item.priceAtOrder || item.price_at_order || item.Product?.price || 0;
        return sum + (parseFloat(price) * item.quantity);
      }, 0);
      return total.toFixed(2);
    }
    return '0.00';
  };

  const loadReports = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;

      const [dailyEarnings, monthlyEarnings, topSelling] = await Promise.all([
        reportAPI.getDailyEarnings(today),
        reportAPI.getMonthlyEarnings(year, month),
        reportAPI.getTopSelling({ period: 'month' }),
      ]);

      setReports({
        daily: dailyEarnings.data,
        monthly: monthlyEarnings.data,
        topSelling: topSelling.data,
      });
    } catch (err) {
      console.error('Error loading reports:', err);
    }
  };

  const handleProductFormChange = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productAPI.update(editingProduct.id, productForm);
      } else {
        await productAPI.create(productForm);
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        initialQuantity: '',
        categoryId: '',
        brandId: '',
        colorId: '',
        sizeId: '',
        genderId: '',
        imageUrl: '',
      });
      loadProducts();
    } catch (err) {
      setError('Failed to save product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      initialQuantity: product.initialQuantity,
      categoryId: product.categoryId,
      brandId: product.brandId,
      colorId: product.colorId,
      sizeId: product.sizeId,
      genderId: product.genderId,
      imageUrl: product.imageUrl || '',
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(id);
        loadProducts();
      } catch (err) {
        setError('Failed to delete product');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      loadOrders();
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  return (
    <div className="container admin-container">
      <h1>Admin Dashboard</h1>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button
          className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Manage Data
        </button>
        {(isAdmin() || isAdvanced()) && (
          <button
            className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      {activeTab === 'products' && (
        <div className="admin-section">
          <div className="section-header">
            <h2>Products Management</h2>
            <button
              onClick={() => {
                setShowProductForm(!showProductForm);
                setEditingProduct(null);
                setProductForm({
                  name: '',
                  description: '',
                  price: '',
                  initialQuantity: '',
                  categoryId: '',
                  brandId: '',
                  colorId: '',
                  sizeId: '',
                  genderId: '',
                  imageUrl: '',
                });
              }}
              className="btn btn-primary"
            >
              {showProductForm ? 'Cancel' : 'Add Product'}
            </button>
          </div>

          {showProductForm && (
            <form onSubmit={handleCreateProduct} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={productForm.name}
                    onChange={handleProductFormChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    name="price"
                    value={productForm.price}
                    onChange={handleProductFormChange}
                    required
                    step="0.01"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    name="initialQuantity"
                    value={productForm.initialQuantity}
                    onChange={handleProductFormChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleProductFormChange}
                  required
                  className="form-input"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={productForm.imageUrl}
                  onChange={handleProductFormChange}
                  placeholder="https://example.com/image.jpg"
                  className="form-input"
                />
                <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
                  Enter the full URL of the product image
                </small>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="categoryId"
                    value={productForm.categoryId}
                    onChange={handleProductFormChange}
                    required
                    className="form-input"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <select
                    name="brandId"
                    value={productForm.brandId}
                    onChange={handleProductFormChange}
                    required
                    className="form-input"
                  >
                    <option value="">Select Brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    name="genderId"
                    value={productForm.genderId}
                    onChange={handleProductFormChange}
                    required
                    className="form-input"
                  >
                    <option value="">Select Gender</option>
                    {genders.map((gender) => (
                      <option key={gender.id} value={gender.id}>
                        {gender.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Size</label>
                  <select
                    name="sizeId"
                    value={productForm.sizeId}
                    onChange={handleProductFormChange}
                    required
                    className="form-input"
                  >
                    <option value="">Select Size</option>
                    {sizes.map((size) => (
                      <option key={size.id} value={size.id}>
                        {size.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <select
                    name="colorId"
                    value={productForm.colorId}
                    onChange={handleProductFormChange}
                    required
                    className="form-input"
                  >
                    <option value="">Select Color</option>
                    {colors.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          )}

          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>${parseFloat(product.price).toFixed(2)}</td>
                    <td>{product.initialQuantity}</td>
                    <td>{product.Category?.name || 'N/A'}</td>
                    <td>{product.Brand?.name || 'N/A'}</td>
                    <td>
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="btn btn-secondary btn-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="admin-section">
          <h2>Orders Management</h2>
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.Client?.fullName || order.Client?.full_name || 'N/A'}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>${calculateOrderTotal(order)}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="form-input"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="admin-section">
          <h2>Manage Categories, Brands, Sizes, Colors, and Genders</h2>
          <div className="manage-grid">
            <div className="manage-card">
              <h3>Categories ({categories.length})</h3>
              <ul>
                {categories.map((cat) => (
                  <li key={cat.id}>{cat.name}</li>
                ))}
              </ul>
            </div>
            <div className="manage-card">
              <h3>Brands ({brands.length})</h3>
              <ul>
                {brands.map((brand) => (
                  <li key={brand.id}>{brand.name}</li>
                ))}
              </ul>
            </div>
            <div className="manage-card">
              <h3>Sizes ({sizes.length})</h3>
              <ul>
                {sizes.map((size) => (
                  <li key={size.id}>{size.name}</li>
                ))}
              </ul>
            </div>
            <div className="manage-card">
              <h3>Colors ({colors.length})</h3>
              <ul>
                {colors.map((color) => (
                  <li key={color.id}>{color.name}</li>
                ))}
              </ul>
            </div>
            <div className="manage-card">
              <h3>Genders ({genders.length})</h3>
              <ul>
                {genders.map((gender) => (
                  <li key={gender.id}>{gender.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && reports && (
        <div className="admin-section">
          <h2>Sales Reports</h2>
          <div className="reports-grid">
            <div className="report-card">
              <h3>Daily Earnings</h3>
              <p className="report-value">
                ${parseFloat(reports.daily?.total_earnings || 0).toFixed(2)}
              </p>
              <p className="report-label">Today's Revenue</p>
            </div>
            <div className="report-card">
              <h3>Monthly Earnings</h3>
              <p className="report-value">
                ${parseFloat(reports.monthly?.total_earnings || 0).toFixed(2)}
              </p>
              <p className="report-label">This Month</p>
            </div>
            <div className="report-card">
              <h3>Top Selling Products</h3>
              <div className="top-products-list">
                {reports.topSelling?.top_selling_products?.slice(0, 5).map((product, index) => (
                  <div key={index} className="top-product-item">
                    <div className="product-rank">#{index + 1}</div>
                    <div className="product-info">
                      <span className="product-name">{product.product_name}</span>
                      <span className="product-stats">
                        {product.total_quantity_sold} sold · ${product.total_revenue}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
