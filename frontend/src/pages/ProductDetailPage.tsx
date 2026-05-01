import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Product } from "../types/Product";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../services/apiClient";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  if (error || !product) {
    return (
      <div className="error-state">
        <h2>Product not found</h2>
        <Link to="/" className="back-link">Back to listings</Link>
      </div>
    );
  }

  const formattedDate = new Date(product.postedDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="detail-page">
      <Link to="/" className="back-link">← Back to listings</Link>
      <div className="detail-content">
        <img src={product.imageUrl} alt={product.title} className="detail-image" />
        <div className="detail-info">
          <span className="detail-category">{product.category}</span>
          <h1 className="detail-title">{product.title}</h1>
          <p className="detail-price">${product.price.toFixed(2)}</p>
          <p className="detail-description">{product.description}</p>
          <button
            className="add-to-cart-btn detail-add-btn"
            disabled={adding}
            onClick={async () => {
              if (!isAuthenticated) {
                navigate("/login", { state: { from: `/products/${product.id}` } });
                return;
              }
              setAdding(true);
              await addToCart(product.id);
              setAdding(false);
            }}
          >
            {adding ? "Adding..." : "Add to Cart"}
          </button>
          <div className="detail-meta">
            <p><strong>Seller:</strong> {product.sellerName}</p>
            <p><strong>Posted:</strong> {formattedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
