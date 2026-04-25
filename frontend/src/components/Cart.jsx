import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api/orderApi';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    setPlacing(true);
    setError(null);
    setSuccess(null);

    try {
      const orderData = {
        customer_name: customerName.trim(),
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
      };

      const res = await createOrder(orderData);
      setSuccess(`Order #${res.data.id} placed successfully!`);
      clearCart();
      setCustomerName('');

      // Navigate to orders page after a short delay
      setTimeout(() => navigate('/orders'), 2000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : 'Failed to place order. Is the Order Service running?'
      );
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0 && !success) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <span className="empty-icon">🛒</span>
          <h2>Your cart is empty</h2>
          <p>Browse products and add items to get started.</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
            id="browse-products-btn"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Shopping Cart</h1>
        <p className="page-subtitle">{items.length} item(s) in your cart</p>
      </div>

      {success && (
        <div className="alert alert-success" id="order-success">
          ✅ {success}
        </div>
      )}

      {error && (
        <div className="alert alert-error" id="order-error">
          ❌ {error}
        </div>
      )}

      {items.length > 0 && (
        <>
          <div className="cart-items" id="cart-items">
            {items.map((item) => (
              <div className="cart-item" key={item.product.id} id={`cart-item-${item.product.id}`}>
                <div className="cart-item-info">
                  <h3>{item.product.name}</h3>
                  <p className="cart-item-price">
                    ${item.product.price.toFixed(2)} each
                  </p>
                </div>

                <div className="cart-item-controls">
                  <button
                    className="btn btn-sm"
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity - 1)
                    }
                    id={`qty-minus-${item.product.id}`}
                  >
                    −
                  </button>
                  <span className="cart-item-qty">{item.quantity}</span>
                  <button
                    className="btn btn-sm"
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.product.stock}
                    id={`qty-plus-${item.product.id}`}
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>

                <button
                  className="btn btn-remove"
                  onClick={() => removeItem(item.product.id)}
                  id={`remove-item-${item.product.id}`}
                  title="Remove item"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary" id="cart-summary">
            <div className="cart-total">
              <span>Total:</span>
              <span className="total-amount">${totalPrice.toFixed(2)}</span>
            </div>

            <form onSubmit={handlePlaceOrder} className="order-form">
              <input
                type="text"
                placeholder="Your name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="input"
                id="customer-name-input"
              />
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={placing || !customerName.trim()}
                id="place-order-btn"
              >
                {placing ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>

            <button
              className="btn btn-text"
              onClick={clearCart}
              id="clear-cart-btn"
            >
              Clear Cart
            </button>
          </div>
        </>
      )}
    </div>
  );
}
