import React, { useEffect, useState } from "react";
import { Order } from "../types/Order";
import * as orderService from "../services/orderService";

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const data = await orderService.fetchAllOrders();
    setOrders(data);
  }

  useEffect(() => {
    reload().catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(orderId: number, status: string) {
    try {
      const updated = await orderService.updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)));
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="cart-page">
      <h1 className="cart-page__title">All Orders</h1>
      {error && <p className="auth-error auth-error--banner" role="alert">{error}</p>}
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="order-list">
          {orders.map((o) => (
            <div key={o.id} className="order-card">
              <div className="order-card__header">
                <strong>#{o.confirmationNumber}</strong>
                <select
                  value={o.status}
                  onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  aria-label={`Status for order ${o.confirmationNumber}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <p className="order-card__date">
                {new Date(o.orderDate).toLocaleString()} · {o.userEmail || o.userId}
              </p>
              <ul className="order-card__items">
                {o.items.map((it) => (
                  <li key={it.id}>
                    {it.productName} × {it.quantity} — ${it.lineTotal.toFixed(2)}
                  </li>
                ))}
              </ul>
              <div className="order-card__footer">
                <span>Ship to: {o.shippingAddress}</span>
                <strong>Total: ${o.total.toFixed(2)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
