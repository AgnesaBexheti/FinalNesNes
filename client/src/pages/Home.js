import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import EditProductModal from '../components/EditProductModal';
import { productAPI, searchAPI } from '../services/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const gender = searchParams.get('gender');
    const category = searchParams.get('category');

    if (gender || category) {
      handleFilter({ gender, category });
    } else {
      loadProducts();
    }
  }, [searchParams]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    setSearchQuery('');
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadProducts();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await searchAPI.search({ q: searchQuery.trim() });
      setProducts(response.data.products || []);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async (filters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await searchAPI.search(filters);
      setProducts(response.data.products || response.data);
    } catch (err) {
      setError('Failed to filter products');
      console.error('Error filtering products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleCloseEdit = () => {
    setEditingProduct(null);
  };

  const handleSaveEdit = () => {
    loadProducts();
  };

  const activeFilter = searchParams.get('gender') || searchParams.get('category');

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>NEW COLLECTION</h1>
          <p>Spring / Summer 2026</p>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <form onSubmit={handleSearch} className="search-form-minimal">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH"
            className="search-input-minimal"
          />
          <button type="submit" className="search-btn-minimal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
        </form>
      </section>

      {/* Active Filter Tag */}
      {activeFilter && (
        <div className="active-filter">
          <span>{activeFilter.toUpperCase()}</span>
          <button onClick={loadProducts} className="clear-filter">Clear</button>
        </div>
      )}

      {/* Products Grid */}
      <section className="products-container">
        {loading && (
          <div className="loading-minimal">
            <div className="loader"></div>
          </div>
        )}

        {error && <div className="error-minimal">{error}</div>}

        {!loading && !error && products.length === 0 && (
          <div className="no-products-minimal">
            <p>No products found</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="products-grid-minimal">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </section>

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default Home;
