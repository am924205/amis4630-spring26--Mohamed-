import React from "react";
import { Link } from "react-router-dom";

interface CartSummaryProps {
  totalItems: number;
  subtotal: number;
  total: number;
  onClearCart: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({ totalItems, subtotal, total, onClearCart }) => {
  return (
    <div className="cart-summary">
      <h2 className="cart-summary__title">Order Summary</h2>
      <div className="cart-summary__row">
        <span>Items ({totalItems})</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="cart-summary__divider" />
      <div className="cart-summary__row cart-summary__total">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
      <Link to="/checkout" className="auth-submit cart-summary__checkout">
        Proceed to Checkout
      </Link>
      <button className="cart-summary__clear" onClick={onClearCart}>
        Clear Cart
      </button>
    </div>
  );
};

export default CartSummary;
