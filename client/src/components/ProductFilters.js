import React, { useState, useEffect } from 'react';
import {
  categoryAPI,
  brandAPI,
  sizeAPI,
  colorAPI,
  genderAPI,
} from '../services/api';

const ProductFilters = ({ onFilter, onClear }) => {
  const [filters, setFilters] = useState({
    name: '',
    gender: '',
    category: '',
    brand: '',
    size: '',
    color: '',
    price_min: '',
    price_max: '',
    availability: '',
  });

  const [options, setOptions] = useState({
    genders: [],
    categories: [],
    brands: [],
    sizes: [],
    colors: [],
  });

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const [genders, categories, brands, sizes, colors] = await Promise.all([
        genderAPI.getAll(),
        categoryAPI.getAll(),
        brandAPI.getAll(),
        sizeAPI.getAll(),
        colorAPI.getAll(),
      ]);

      setOptions({
        genders: genders.data,
        categories: categories.data,
        brands: brands.data,
        sizes: sizes.data,
        colors: colors.data,
      });
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    const activeFilters = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        activeFilters[key] = filters[key];
      }
    });
    onFilter(activeFilters);
  };

  const handleClear = () => {
    setFilters({
      name: '',
      gender: '',
      category: '',
      brand: '',
      size: '',
      color: '',
      price_min: '',
      price_max: '',
      availability: '',
    });
    onClear();
  };

  return (
    <div className="filters-section">
      <h2>Find Products</h2>
      <div className="filters-grid">
        <input
          type="text"
          name="name"
          value={filters.name}
          onChange={handleChange}
          placeholder="Search by name..."
          className="filter-input"
        />

        <select name="gender" value={filters.gender} onChange={handleChange} className="filter-select">
          <option value="">All Genders</option>
          {options.genders.map((gender) => (
            <option key={gender.id} value={gender.name}>
              {gender.name}
            </option>
          ))}
        </select>

        <select name="category" value={filters.category} onChange={handleChange} className="filter-select">
          <option value="">All Categories</option>
          {options.categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>

        <select name="brand" value={filters.brand} onChange={handleChange} className="filter-select">
          <option value="">All Brands</option>
          {options.brands.map((brand) => (
            <option key={brand.id} value={brand.name}>
              {brand.name}
            </option>
          ))}
        </select>

        <select name="size" value={filters.size} onChange={handleChange} className="filter-select">
          <option value="">All Sizes</option>
          {options.sizes.map((size) => (
            <option key={size.id} value={size.name}>
              {size.name}
            </option>
          ))}
        </select>

        <select name="color" value={filters.color} onChange={handleChange} className="filter-select">
          <option value="">All Colors</option>
          {options.colors.map((color) => (
            <option key={color.id} value={color.name}>
              {color.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="price_min"
          value={filters.price_min}
          onChange={handleChange}
          placeholder="Min Price"
          className="filter-input"
        />

        <input
          type="number"
          name="price_max"
          value={filters.price_max}
          onChange={handleChange}
          placeholder="Max Price"
          className="filter-input"
        />

        <select name="availability" value={filters.availability} onChange={handleChange} className="filter-select">
          <option value="">All Products</option>
          <option value="in_stock">In Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>

        <button onClick={handleSearch} className="btn btn-primary">
          Search
        </button>
        <button onClick={handleClear} className="btn btn-secondary">
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default ProductFilters;
