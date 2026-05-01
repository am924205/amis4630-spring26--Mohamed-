import React, { useEffect, useState } from "react";
import { Product } from "../types/Product";
import ProductList from "../components/ProductList";
import { API_BASE } from "../services/apiClient";

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error-state">Error: {error}</div>;
  }

  return (
    <div className="catalog-page">
      <h1>Buckeye Marketplace</h1>
      <p className="catalog-subtitle">Buy and sell with fellow Buckeyes</p>
      <ProductList products={products} />
    </div>
  );
};

export default ProductListPage;
