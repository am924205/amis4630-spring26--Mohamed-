import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from "../types/Cart";

const API_BASE = "http://localhost:5062";

export async function fetchCart(): Promise<Cart | null> {
  const res = await fetch(`${API_BASE}/api/cart`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json();
}

export async function addToCart(request: AddToCartRequest): Promise<CartItem> {
  const res = await fetch(`${API_BASE}/api/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Failed to add item to cart" }));
    throw new Error(error.message || "Failed to add item to cart");
  }
  return res.json();
}

export async function updateCartItem(
  cartItemId: number,
  request: UpdateCartItemRequest
): Promise<CartItem> {
  const res = await fetch(`${API_BASE}/api/cart/${cartItemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error("Failed to update cart item");
  return res.json();
}

export async function removeCartItem(cartItemId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/cart/${cartItemId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove item from cart");
}

export async function clearCart(): Promise<void> {
  const res = await fetch(`${API_BASE}/api/cart/clear`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to clear cart");
}
