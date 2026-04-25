import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addItem, items } = useCart();
  const inCart = items.find((i) => i.product.id === product.id);
  const outOfStock = product.stock <= 0;

  return (
    <div className="product-card" id={`product-card-${product.id}`}>
      <div className="product-card-header">
        <div className="product-icon">
          {product.name.includes('Headphone') && '🎧'}
          {product.name.includes('Keyboard') && '⌨️'}
          {product.name.includes('Monitor') && '🖥️'}
          {product.name.includes('USB') && '🔌'}
          {product.name.includes('SSD') && '💾'}
          {product.name.includes('Webcam') && '📷'}
          {!['Headphone', 'Keyboard', 'Monitor', 'USB', 'SSD', 'Webcam'].some(
            (k) => product.name.includes(k)
          ) && '📦'}
        </div>
        <span className={`stock-badge ${outOfStock ? 'out' : product.stock < 20 ? 'low' : 'in'}`}>
          {outOfStock ? 'Out of Stock' : product.stock < 20 ? `Only ${product.stock} left` : 'In Stock'}
        </span>
      </div>

      <h3 className="product-name">{product.name}</h3>
      <p className="product-description">{product.description}</p>

      <div className="product-card-footer">
        <span className="product-price">${product.price.toFixed(2)}</span>
        <button
          className={`btn btn-add ${inCart ? 'btn-in-cart' : ''}`}
          onClick={() => addItem(product)}
          disabled={outOfStock}
          id={`add-to-cart-${product.id}`}
        >
          {outOfStock ? 'Unavailable' : inCart ? `In Cart (${inCart.quantity})` : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
