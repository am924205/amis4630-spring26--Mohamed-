import React from "react";
import { useCart } from "../context/CartContext";

const Notification: React.FC = () => {
  const { state, clearNotification } = useCart();

  if (!state.notification && !state.error) return null;

  const isError = !!state.error;
  const message = state.error || state.notification;

  return (
    <div className={`notification ${isError ? "notification--error" : "notification--success"}`}>
      <span>{message}</span>
      <button className="notification__close" onClick={clearNotification}>
        &times;
      </button>
    </div>
  );
};

export default Notification;
