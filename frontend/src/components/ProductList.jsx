import { useState, useEffect } from 'react';
import { getProducts } from '../api/productApi';
import ProductCard from './ProductCard';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Failed to load products. Is the Product Service running?'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-container" id="product-error">
          <span className="error-icon">⚠️</span>
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchProducts}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Product Catalog</h1>
        <p className="page-subtitle">
          {products.length} products available • Powered by Product Service
        </p>
      </div>

      <div className="product-grid" id="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="empty-state">
          <p>No products found. Seed the Product Service database.</p>
        </div>
      )}
    </div>
  );
}
