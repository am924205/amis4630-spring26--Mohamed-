import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Product } from "../types/Product";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/" } });
      return;
    }
    setAdding(true);
    await addToCart(product.id);
    setAdding(false);
  };

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <img src={product.imageUrl} alt={product.title} className="product-card__image" />
      <div className="product-card__body">
        <span className="product-card__category">{product.category}</span>
        <h3 className="product-card__title">{product.title}</h3>
        <p className="product-card__price">${product.price.toFixed(2)}</p>
        <p className="product-card__seller">Seller: {product.sellerName}</p>
        <button
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={adding}
        >
          {adding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
