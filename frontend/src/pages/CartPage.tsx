import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartItemCard from "../components/CartItemCard";
import CartSummary from "../components/CartSummary";

const CartPage: React.FC = () => {
  const { state, updateQuantity, removeItem, clearCart } = useCart();

  if (state.loading) {
    return <div className="loading">Loading cart...</div>;
  }

  if (state.error) {
    return (
      <div className="error-state">
        <h2>Something went wrong</h2>
        <p>{state.error}</p>
        <Link to="/" className="back-link">Back to listings</Link>
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className="cart-page">
        <h1 className="cart-page__title">Your Cart</h1>
        <div className="cart-empty">
          <h2>Your cart is empty</h2>
          <p>Browse our marketplace to find something you like!</p>
          <Link to="/" className="cart-empty__link">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-page__title">Your Cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {state.items.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>
        <CartSummary
          totalItems={state.totalItems}
          subtotal={state.subtotal}
          total={state.total}
          onClearCart={clearCart}
        />
      </div>
    </div>
  );
};

export default CartPage;
