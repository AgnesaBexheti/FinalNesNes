import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product, onEdit }) => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    // Add product with discounted price if applicable
    const productWithPrice = {
      ...product,
      price: discountedPrice,
      originalPrice: activeDiscount ? originalPrice : null,
    };
    addItem(productWithPrice);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(product);
    }
  };

  const isOutOfStock = product.initialQuantity <= 0;
  const canEdit = user && (user.roleName === 'admin' || user.roleName === 'advanced');

  // Check for active discount
  const activeDiscount = product.Discounts?.find(d => d.active) || null;
  const originalPrice = parseFloat(product.price);
  const discountedPrice = activeDiscount
    ? originalPrice * (1 - activeDiscount.percentage / 100)
    : originalPrice;

  return (
    <div
      className="product-card-minimal"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-image-minimal">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="no-image">
            <span>No Image</span>
          </div>
        )}

        {/* Quick Actions on Hover */}
        <div className={`product-overlay ${isHovered ? 'visible' : ''}`}>
          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              className={`add-to-cart-btn ${added ? 'added' : ''}`}
            >
              {added ? 'ADDED' : 'ADD TO BAG'}
            </button>
          )}
          {canEdit && (
            <button onClick={handleEdit} className="edit-btn">
              EDIT
            </button>
          )}
        </div>

        {isOutOfStock && (
          <div className="out-of-stock-badge">SOLD OUT</div>
        )}
      </div>

      <div className="product-details-minimal">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-brand">{product.Brand?.name}</p>

        {activeDiscount ? (
          <div className="product-price-minimal">
            <span className="original-price">${originalPrice.toFixed(2)}</span>
            <span className="discounted-price">${discountedPrice.toFixed(2)}</span>
            <span className="discount-badge">-{activeDiscount.percentage}%</span>
          </div>
        ) : (
          <p className="product-price-minimal">${originalPrice.toFixed(2)}</p>
        )}

        <div className="product-meta">
          <span>{product.Color?.name}</span>
          {product.Size?.name && <span> | {product.Size?.name}</span>}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
