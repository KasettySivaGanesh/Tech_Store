import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import OrderHistory from './components/OrderHistory';

export default function App() {
  return (
    <CartProvider>
      <Router>
        <div className="app" id="app-root">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<ProductList />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<OrderHistory />} />
            </Routes>
          </main>
          <footer className="footer" id="app-footer">
            <p>
              TechStore Microservices Demo •
              <span className="service-tag">Product Service</span>
              <span className="service-tag">Order Service</span>
              <span className="service-tag">React Frontend</span>
            </p>
          </footer>
        </div>
      </Router>
    </CartProvider>
  );
}
