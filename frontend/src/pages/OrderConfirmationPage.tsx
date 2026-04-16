import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Order } from "../types/Order";

const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams();
  const location = useLocation() as { state?: { order?: Order } };
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="cart-page">
        <h1 className="cart-page__title">Order Placed</h1>
        <p>Your order #{id} has been submitted.</p>
        <Link to="/orders" className="cart-empty__link">View order history</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-page__title">Thanks for your order!</h1>
      <p className="order-confirmation__message">
        Confirmation number: <strong>{order.confirmationNumber}</strong>
      </p>
      <div className="cart-layout">
        <div className="cart-items">
          {order.items.map((it) => (
            <div key={it.id} className="cart-summary__row">
              <span>{it.productName} × {it.quantity}</span>
              <span>${it.lineTotal.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h2 className="cart-summary__title">Summary</h2>
          <div className="cart-summary__row"><span>Status</span><span>{order.status}</span></div>
          <div className="cart-summary__row"><span>Shipping</span><span>{order.shippingAddress}</span></div>
          <div className="cart-summary__divider" />
          <div className="cart-summary__row cart-summary__total">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
          <Link to="/orders" className="cart-empty__link">View order history</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
