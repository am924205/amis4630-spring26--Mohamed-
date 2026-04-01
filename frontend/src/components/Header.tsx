import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Header: React.FC = () => {
  const { state } = useCart();

  return (
    <header className="site-header">
      <Link to="/" className="site-header__logo">
        Buckeye Marketplace
      </Link>
      <nav className="site-header__nav">
        <Link to="/" className="site-header__link">Products</Link>
        <Link to="/cart" className="site-header__link site-header__cart">
          Cart
          {state.totalItems > 0 && (
            <span className="cart-badge">{state.totalItems}</span>
          )}
        </Link>
      </nav>
    </header>
  );
};

export default Header;
