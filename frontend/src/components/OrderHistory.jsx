import { useState, useEffect } from 'react';
import { getOrders, getOrder } from '../api/orderApi';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getOrders();
      setOrders(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Failed to load orders. Is the Order Service running?'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderDetails = async (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    setExpandedOrder(orderId);

    if (!orderDetails[orderId]) {
      try {
        const res = await getOrder(orderId);
        setOrderDetails((prev) => ({ ...prev, [orderId]: res.data }));
      } catch (err) {
        console.error('Failed to fetch order details:', err);
      }
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-container" id="order-history-error">
          <span className="error-icon">⚠️</span>
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchOrders}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Order History</h1>
        <p className="page-subtitle">
          {orders.length} order(s) • Powered by Order Service
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <h2>No orders yet</h2>
          <p>Place your first order from the product catalog.</p>
        </div>
      ) : (
        <div className="order-list" id="order-list">
          {orders.map((order) => (
            <div
              className={`order-card ${expandedOrder === order.id ? 'expanded' : ''}`}
              key={order.id}
              id={`order-card-${order.id}`}
            >
              <div
                className="order-card-header"
                onClick={() => toggleOrderDetails(order.id)}
              >
                <div className="order-meta">
                  <span className="order-id">Order #{order.id}</span>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>
                </div>
                <div className="order-info">
                  <span className="order-customer">{order.customer_name}</span>
                  <span className="order-date">{formatDate(order.created_at)}</span>
                </div>
                <div className="order-summary-row">
                  <span>{order.item_count} item(s)</span>
                  <span className="order-total">
                    ${Number(order.total_amount).toFixed(2)}
                  </span>
                  <span className="expand-icon">
                    {expandedOrder === order.id ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {expandedOrder === order.id && orderDetails[order.id] && (
                <div className="order-card-body">
                  <table className="order-items-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetails[order.id].items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.product_name}</td>
                          <td>{item.quantity}</td>
                          <td>${Number(item.unit_price).toFixed(2)}</td>
                          <td>
                            ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
