import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Order } from "../types/Order";
import * as orderService from "../services/orderService";

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await orderService.fetchMyOrders();
        setOrders(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="loading">Loading your orders...</div>;
  if (error) return <div className="error-state"><p>{error}</p></div>;

  return (
    <div className="cart-page">
      <h1 className="cart-page__title">My Orders</h1>
      {orders.length === 0 ? (
        <div className="cart-empty">
          <p>You have no orders yet.</p>
          <Link to="/" className="cart-empty__link">Start shopping</Link>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((o) => (
            <div key={o.id} className="order-card">
              <div className="order-card__header">
                <strong>#{o.confirmationNumber}</strong>
                <span className="order-card__status">{o.status}</span>
              </div>
              <p className="order-card__date">{new Date(o.orderDate).toLocaleString()}</p>
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

export default OrderHistoryPage;
