import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../services/api';

const Cart = () => {
  const { items:cart, removeItem:removeFromCart, updateQuantity, clearCart } = useCart();
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  console.log({cart})
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleClientInfoChange = (e) => {
    setClientInfo({
      ...clientInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const calculateTotal = () => {
    return cart?.reduce((total, item) => {
      return total + parseFloat(item.price) * item.quantity;
    }, 0);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Calculate total before sending
    const totalAmount = calculateTotal();

    try {
      const orderData = {
        client: clientInfo,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: parseFloat(item.price), // Include price for verification
        })),
        totalPrice: totalAmount, // Pass total to backend
      };

      console.log('Sending order data:', orderData);
      await orderAPI.create(orderData);
      setSuccess(true);
      clearCart();
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="order-success-page">
        <div className="order-success-content">
          <div className="success-icon">✓</div>
          <h1>ORDER CONFIRMED</h1>
          <p>Thank you for your purchase</p>
          <span className="redirect-text">Redirecting to home page...</span>
        </div>
      </div>
    );
  }

  if (cart?.length === 0) {
    return (
      <div className="empty-cart-page">
        <div className="empty-cart-content">
          <h1>YOUR BAG IS EMPTY</h1>
          <p>Looks like you haven't added anything yet</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">SHOPPING BAG</h1>
      <div className="cart-container">
        <div className="cart-items">
          <h2>Cart Items ({cart?.length})</h2>
          {cart?.map((item) => (
            <div key={item.id} className="cart-item">
              {item.imageUrl && (
                <div className="cart-item-image">
                  <img src={item.imageUrl} alt={item.name} />
                </div>
              )}
              <div className="cart-item-details">
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="cart-item-description">{item.description}</p>
                  <div className="cart-item-meta">
                    {item.Gender?.name && <span className="meta-badge">{item.Gender.name}</span>}
                    {item.Category?.name && <span className="meta-badge">{item.Category.name}</span>}
                    {item.Brand?.name && <span className="meta-badge">{item.Brand.name}</span>}
                    {item.Size?.name && <span className="meta-badge">Size: {item.Size.name}</span>}
                    {item.Color?.name && <span className="meta-badge">Color: {item.Color.name}</span>}
                  </div>
                  <p className="cart-item-price">Price: ${parseFloat(item.price).toFixed(2)}</p>
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-control">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="qty-btn"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="qty-btn"
                      disabled={item.quantity >= item.initialQuantity}
                    >
                      +
                    </button>
                  </div>
                  <div className="cart-item-subtotal">
                    <strong>Subtotal: ${(parseFloat(item.price) * item.quantity).toFixed(2)}</strong>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="btn btn-danger btn-sm">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="cart-summary">
            <div className="cart-total">
              <h3>Total Amount: ${calculateTotal()?.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        <div className="checkout-form">
          <h2>Checkout</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleCheckout}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={clientInfo.name}
                onChange={handleClientInfoChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={clientInfo.email}
                onChange={handleClientInfoChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={clientInfo.phone}
                onChange={handleClientInfoChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={clientInfo.address}
                onChange={handleClientInfoChange}
                required
                className="form-input"
                rows="3"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cart;
