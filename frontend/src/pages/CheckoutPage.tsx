import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import * as orderService from "../services/orderService";

const CheckoutPage: React.FC = () => {
  const { state, refreshCart } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState("");
  const [addressError, setAddressError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setAddressError("Shipping address is required.");
      return;
    }
    setAddressError(null);
    setServerError(null);
    setSubmitting(true);
    try {
      const order = await orderService.createOrder({ shippingAddress });
      await refreshCart();
      navigate(`/orders/confirmation/${order.id}`, {
        state: { order },
        replace: true,
      });
    } catch (err: any) {
      setServerError(err?.message || "Failed to place order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (state.loading) return <div className="loading">Loading checkout...</div>;

  if (state.items.length === 0) {
    return (
      <div className="cart-page">
        <h1 className="cart-page__title">Checkout</h1>
        <div className="cart-empty">
          <h2>Your cart is empty</h2>
          <p>Add items to your cart before checking out.</p>
          <Link to="/" className="cart-empty__link">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 className="cart-page__title">Checkout</h1>
      <div className="cart-layout">
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <h2>Shipping Address</h2>
          <div className="auth-field">
            <label htmlFor="shipping">Address</label>
            <textarea
              id="shipping"
              rows={4}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="123 High St, Columbus, OH 43210"
              aria-invalid={!!addressError}
            />
            {addressError && <p className="auth-error" role="alert">{addressError}</p>}
          </div>
          {serverError && <p className="auth-error auth-error--banner" role="alert">{serverError}</p>}
          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? "Placing order..." : `Place Order — $${state.total.toFixed(2)}`}
          </button>
        </form>

        <div className="cart-summary">
          <h2 className="cart-summary__title">Order Summary</h2>
          {state.items.map((it) => (
            <div className="cart-summary__row" key={it.id}>
              <span>{it.productName} × {it.quantity}</span>
              <span>${it.lineTotal.toFixed(2)}</span>
            </div>
          ))}
          <div className="cart-summary__divider" />
          <div className="cart-summary__row cart-summary__total">
            <span>Total</span>
            <span>${state.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
