import React, { useEffect, useState } from "react";
import { Product } from "../types/Product";
import * as productService from "../services/productService";

const emptyForm: Omit<Product, "id"> = {
  title: "",
  description: "",
  price: 0,
  category: "",
  sellerName: "",
  postedDate: new Date().toISOString(),
  imageUrl: "",
};

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Omit<Product, "id">>({ ...emptyForm });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const data = await productService.fetchProducts();
    setProducts(data);
  }

  useEffect(() => {
    reload().catch((e) => setError(e.message));
  }, []);

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description,
      price: p.price,
      category: p.category,
      sellerName: p.sellerName,
      postedDate: p.postedDate,
      imageUrl: p.imageUrl,
    });
  }

  function cancel() {
    setEditingId(null);
    setForm({ ...emptyForm });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editingId != null) {
        await productService.updateProduct(editingId, { id: editingId, ...form });
      } else {
        await productService.createProduct(form);
      }
      cancel();
      await reload();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this product?")) return;
    try {
      await productService.deleteProduct(id);
      await reload();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="cart-page">
      <h1 className="cart-page__title">Manage Products</h1>
      {error && <p className="auth-error auth-error--banner" role="alert">{error}</p>}
      <form className="admin-form" onSubmit={handleSubmit}>
        <h2>{editingId != null ? "Edit Product" : "Add Product"}</h2>
        <div className="admin-form__row">
          <input placeholder="Title" value={form.title}
                 onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input placeholder="Category" value={form.category}
                 onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input type="number" step="0.01" min="0" placeholder="Price"
                 value={form.price}
                 onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} required />
          <input placeholder="Seller" value={form.sellerName}
                 onChange={(e) => setForm({ ...form, sellerName: e.target.value })} />
          <input placeholder="Image URL" value={form.imageUrl}
                 onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        </div>
        <textarea placeholder="Description" rows={3} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="admin-form__actions">
          <button className="auth-submit" type="submit">
            {editingId != null ? "Save Changes" : "Create Product"}
          </button>
          {editingId != null && (
            <button type="button" className="btn-secondary" onClick={cancel}>Cancel</button>
          )}
        </div>
      </form>

      <div className="admin-product-list">
        {products.map((p) => (
          <div key={p.id} className="admin-product-row">
            <div>
              <strong>{p.title}</strong>
              <div className="admin-product-row__meta">
                {p.category} · ${p.price.toFixed(2)} · {p.sellerName}
              </div>
            </div>
            <div className="admin-product-row__actions">
              <button className="btn-secondary" onClick={() => startEdit(p)}>Edit</button>
              <button className="btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProductsPage;
