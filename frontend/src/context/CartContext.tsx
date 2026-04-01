import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { Cart, CartItem } from "../types/Cart";
import * as cartService from "../services/cartService";

// State shape
interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  total: number;
  loading: boolean;
  error: string | null;
  notification: string | null;
}

// Actions
type CartAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Cart | null }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "SET_ITEMS"; payload: CartItem[] }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_NOTIFICATION"; payload: string }
  | { type: "CLEAR_NOTIFICATION" }
  | { type: "CLEAR_ALL" };

const initialState: CartState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  total: 0,
  loading: true,
  error: null,
  notification: null,
};

function recalculateTotals(items: CartItem[]) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  return { totalItems, subtotal, total: subtotal };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS": {
      if (!action.payload) {
        return { ...state, items: [], totalItems: 0, subtotal: 0, total: 0, loading: false };
      }
      return {
        ...state,
        items: action.payload.items,
        totalItems: action.payload.totalItems,
        subtotal: action.payload.subtotal,
        total: action.payload.total,
        loading: false,
      };
    }
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "SET_ITEMS": {
      const totals = recalculateTotals(action.payload);
      return { ...state, items: action.payload, ...totals, loading: false };
    }
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "SET_NOTIFICATION":
      return { ...state, notification: action.payload };
    case "CLEAR_NOTIFICATION":
      return { ...state, notification: null };
    case "CLEAR_ALL":
      return { ...state, items: [], totalItems: 0, subtotal: 0, total: 0 };
    default:
      return state;
  }
}

// Context type
interface CartContextType {
  state: CartState;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  clearNotification: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const refreshCart = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const cart = await cartService.fetchCart();
      dispatch({ type: "FETCH_SUCCESS", payload: cart });
    } catch {
      dispatch({ type: "FETCH_ERROR", payload: "Failed to load cart" });
    }
  }, []);

  // Load cart on mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Auto-clear notifications after 3 seconds
  useEffect(() => {
    if (state.notification) {
      const timer = setTimeout(() => dispatch({ type: "CLEAR_NOTIFICATION" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [state.notification]);

  const addToCart = async (productId: number, quantity: number = 1) => {
    try {
      await cartService.addToCart({ productId, quantity });
      await refreshCart();
      dispatch({ type: "SET_NOTIFICATION", payload: "Item added to cart!" });
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    if (quantity < 1) return;
    // Optimistic update
    const prevItems = state.items;
    const optimisticItems = state.items.map((item) =>
      item.id === cartItemId
        ? { ...item, quantity, lineTotal: item.price * quantity }
        : item
    );
    dispatch({ type: "SET_ITEMS", payload: optimisticItems });

    try {
      await cartService.updateCartItem(cartItemId, { quantity });
      dispatch({ type: "SET_NOTIFICATION", payload: "Quantity updated" });
    } catch {
      dispatch({ type: "SET_ITEMS", payload: prevItems });
      dispatch({ type: "SET_ERROR", payload: "Failed to update quantity" });
    }
  };

  const removeItem = async (cartItemId: number) => {
    const prevItems = state.items;
    const optimisticItems = state.items.filter((item) => item.id !== cartItemId);
    dispatch({ type: "SET_ITEMS", payload: optimisticItems });

    try {
      await cartService.removeCartItem(cartItemId);
      dispatch({ type: "SET_NOTIFICATION", payload: "Item removed from cart" });
    } catch {
      dispatch({ type: "SET_ITEMS", payload: prevItems });
      dispatch({ type: "SET_ERROR", payload: "Failed to remove item" });
    }
  };

  const clearCartAction = async () => {
    const prevItems = state.items;
    dispatch({ type: "CLEAR_ALL" });

    try {
      await cartService.clearCart();
      dispatch({ type: "SET_NOTIFICATION", payload: "Cart cleared" });
    } catch {
      dispatch({ type: "SET_ITEMS", payload: prevItems });
      dispatch({ type: "SET_ERROR", payload: "Failed to clear cart" });
    }
  };

  const clearNotification = () => dispatch({ type: "CLEAR_NOTIFICATION" });

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart: clearCartAction,
        refreshCart,
        clearNotification,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
