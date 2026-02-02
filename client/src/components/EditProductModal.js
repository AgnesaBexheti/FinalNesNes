import React, { useState, useEffect } from 'react';
import { productAPI, categoryAPI, brandAPI, sizeAPI, colorAPI, genderAPI } from '../services/api';

const EditProductModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    initialQuantity: '',
    imageUrl: '',
    categoryId: '',
    brandId: '',
    sizeId: '',
    colorId: '',
    genderId: ''
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [genders, setGenders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        initialQuantity: product.initialQuantity || '',
        imageUrl: product.imageUrl || '',
        categoryId: product.categoryId || '',
        brandId: product.brandId || '',
        sizeId: product.sizeId || '',
        colorId: product.colorId || '',
        genderId: product.genderId || ''
      });
      loadOptions();
    }
  }, [product]);

  const loadOptions = async () => {
    try {
      const [categoriesRes, brandsRes, sizesRes, colorsRes, gendersRes] = await Promise.all([
        categoryAPI.getAll(),
        brandAPI.getAll(),
        sizeAPI.getAll(),
        colorAPI.getAll(),
        genderAPI.getAll()
      ]);

      setCategories(categoriesRes.data);
      setBrands(brandsRes.data);
      setSizes(sizesRes.data);
      setColors(colorsRes.data);
      setGenders(gendersRes.data);
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await productAPI.update(product.id, {
        ...formData,
        price: parseFloat(formData.price),
        initialQuantity: parseInt(formData.initialQuantity),
        categoryId: parseInt(formData.categoryId),
        brandId: parseInt(formData.brandId),
        sizeId: parseInt(formData.sizeId),
        colorId: parseInt(formData.colorId),
        genderId: parseInt(formData.genderId)
      });

      alert('Product updated successfully!');
      onSave();
      onClose();
    } catch (error) {
      alert('Error updating product: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <span className="modal-close" onClick={onClose}>&times;</span>
        <h2>Edit Product</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Price *</label>
            <input
              type="number"
              step="0.01"
              name="price"
              className="form-control"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Quantity *</label>
            <input
              type="number"
              name="initialQuantity"
              className="form-control"
              value={formData.initialQuantity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input
              type="text"
              name="imageUrl"
              className="form-control"
              value={formData.imageUrl}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="categoryId"
              className="form-control"
              value={formData.categoryId}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Brand *</label>
            <select
              name="brandId"
              className="form-control"
              value={formData.brandId}
              onChange={handleChange}
              required
            >
              <option value="">Select Brand</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Size *</label>
            <select
              name="sizeId"
              className="form-control"
              value={formData.sizeId}
              onChange={handleChange}
              required
            >
              <option value="">Select Size</option>
              {sizes.map(size => (
                <option key={size.id} value={size.id}>{size.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Color *</label>
            <select
              name="colorId"
              className="form-control"
              value={formData.colorId}
              onChange={handleChange}
              required
            >
              <option value="">Select Color</option>
              {colors.map(color => (
                <option key={color.id} value={color.id}>{color.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Gender *</label>
            <select
              name="genderId"
              className="form-control"
              value={formData.genderId}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              {genders.map(gender => (
                <option key={gender.id} value={gender.id}>{gender.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
