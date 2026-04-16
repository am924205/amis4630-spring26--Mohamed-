import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Header: React.FC = () => {
  const { state } = useCart();
  const { isAuthenticated, isAdmin, state: authState, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="site-header">
      <Link to="/" className="site-header__logo">
        Buckeye Marketplace
      </Link>
      <nav className="site-header__nav">
        <Link to="/" className="site-header__link">Products</Link>
        {isAuthenticated && (
          <>
            <Link to="/cart" className="site-header__link site-header__cart">
              Cart
              {state.totalItems > 0 && (
                <span className="cart-badge">{state.totalItems}</span>
              )}
            </Link>
            <Link to="/orders" className="site-header__link">My Orders</Link>
          </>
        )}
        {isAdmin && (
          <Link to="/admin" className="site-header__link">Admin</Link>
        )}
        {isAuthenticated ? (
          <>
            <span className="site-header__user">{authState.user?.displayName}</span>
            <button className="site-header__link site-header__logout" onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="site-header__link">Log In</Link>
            <Link to="/register" className="site-header__link">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
