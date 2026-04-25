import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" id="navbar-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-text">TechStore</span>
          <span className="brand-tag">microservices</span>
        </Link>

        <div className="navbar-links">
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            id="nav-products"
          >
            Products
          </Link>
          <Link
            to="/cart"
            className={`nav-link cart-link ${isActive('/cart') ? 'active' : ''}`}
            id="nav-cart"
          >
            Cart
            {totalItems > 0 && (
              <span className="cart-badge" id="cart-badge">
                {totalItems}
              </span>
            )}
          </Link>
          <Link
            to="/orders"
            className={`nav-link ${isActive('/orders') ? 'active' : ''}`}
            id="nav-orders"
          >
            Orders
          </Link>
        </div>
      </div>
    </nav>
  );
}
