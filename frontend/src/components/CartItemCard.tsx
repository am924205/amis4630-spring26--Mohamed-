import React from "react";
import { CartItem } from "../types/Cart";

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (cartItemId: number, quantity: number) => void;
  onRemove: (cartItemId: number) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="cart-item">
      <img
        src={item.imageUrl || "/placeholder.png"}
        alt={item.productName}
        className="cart-item__image"
      />
      <div className="cart-item__details">
        <h3 className="cart-item__name">{item.productName}</h3>
        <p className="cart-item__price">${item.price.toFixed(2)}</p>
      </div>
      <div className="cart-item__quantity">
        <button
          className="qty-btn"
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          disabled={item.quantity <= 1}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="qty-value">{item.quantity}</span>
        <button
          className="qty-btn"
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          disabled={item.quantity >= 99}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <div className="cart-item__total">
        <p>${item.lineTotal.toFixed(2)}</p>
      </div>
      <button
        className="cart-item__remove"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.productName}`}
      >
        Remove
      </button>
    </div>
  );
};

export default CartItemCard;
