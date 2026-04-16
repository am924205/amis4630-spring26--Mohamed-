import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from "../types/Cart";
import { apiFetch, apiJson } from "./apiClient";

export async function fetchCart(): Promise<Cart | null> {
  const res = await apiFetch("/api/cart");
  if (res.status === 401 || res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json();
}

export async function addToCart(request: AddToCartRequest): Promise<CartItem> {
  return apiJson<CartItem>("/api/cart", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function updateCartItem(
  cartItemId: number,
  request: UpdateCartItemRequest
): Promise<CartItem> {
  return apiJson<CartItem>(`/api/cart/${cartItemId}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export async function removeCartItem(cartItemId: number): Promise<void> {
  const res = await apiFetch(`/api/cart/${cartItemId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to remove item from cart");
}

export async function clearCart(): Promise<void> {
  const res = await apiFetch("/api/cart/clear", { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to clear cart");
}
