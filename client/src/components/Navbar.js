import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isManager } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const cartItemCount = getTotalItems();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
            <span className={`hamburger ${menuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          <Link to="/" className="nav-logo" onClick={closeMenu}>
            <img src="/images/nesnes-logo.png" alt="NesNes" className="nav-logo-img" />
            NESNES
          </Link>

          <div className="nav-actions">
            {isAuthenticated && (
              <span className="nav-user">{user?.username}</span>
            )}
            <Link to="/cart" className="nav-cart" onClick={closeMenu}>
              BAG [{cartItemCount}]
            </Link>
          </div>
        </div>
      </nav>

      {/* Slide-out Menu */}
      <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <div className="side-menu-content">
          <div className="side-menu-section">
            <h3>SHOP</h3>
            <Link to="/" onClick={closeMenu}>All Products</Link>
            <Link to="/?gender=Women" onClick={closeMenu}>Women</Link>
            <Link to="/?gender=Men" onClick={closeMenu}>Men</Link>
            <Link to="/?gender=Unisex" onClick={closeMenu}>Unisex</Link>
          </div>

          <div className="side-menu-section">
            <h3>CATEGORIES</h3>
            <Link to="/?category=Shirts" onClick={closeMenu}>Shirts</Link>
            <Link to="/?category=Pants" onClick={closeMenu}>Pants</Link>
            <Link to="/?category=Jackets" onClick={closeMenu}>Jackets</Link>
            <Link to="/?category=Shoes" onClick={closeMenu}>Shoes</Link>
          </div>

          <div className="side-menu-section">
            <h3>ACCOUNT</h3>
            {isAuthenticated ? (
              <>
                <span className="menu-user-info">{user?.username} ({user?.roleName})</span>
                {(isAdmin() || isManager()) && (
                  <Link to="/admin" onClick={closeMenu}>Dashboard</Link>
                )}
                <button onClick={handleLogout} className="menu-logout">Log Out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu}>Log In</Link>
                <Link to="/register" onClick={closeMenu}>Register</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
    </>
  );
};

export default Navbar;
