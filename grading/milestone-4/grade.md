# Milestone 4 — Cart Feature Grade

## 0. Build & Run Status

| Component           | Build | Runs | Notes                                                    |
| ------------------- | ----- | ---- | -------------------------------------------------------- |
| Backend (.NET)      | ✅    | ✅    | `dotnet build` succeeded (0 warnings). `dotnet run` starts on port 5099 after JWT key configured via user-secrets. |
| Frontend (React/TS) | ✅    | ✅    | `npm install` + `npm run build` succeeded.               |
| API Endpoints       | —     | ✅    | GET /api/products (200, 10 items), GET /api/cart (200, authenticated), POST /api/cart verified. |

---

## 1. Cart State Management (5 / 5)

| Sub-item | Points | Earned | Evidence |
|----------|--------|--------|----------|
| useReducer or Context API for cart state | 2 | 2 | `CartContext.tsx` uses `useReducer` with a well-defined `CartAction` discriminated union and `CartState` interface. `CartProvider` wraps children with Context. |
| Add, update quantity, remove operations | 2 | 2 | `addToCart`, `updateQuantity`, `removeItem`, `clearCart` all implemented in `CartContext.tsx` lines 100–160. Update/remove use **optimistic updates** with rollback on error — exceeds expectations. |
| Cart count in header + calculated totals | 1 | 1 | `Header.tsx` displays `state.totalItems` in a `<span className="cart-badge">`. `recalculateTotals()` in `CartContext.tsx` computes `totalItems`, `subtotal`, `total` from item array. |

**Subtotal: 5 / 5**

---

## 2. Cart API Endpoints (5 / 5)

| Sub-item | Points | Earned | Evidence |
|----------|--------|--------|----------|
| GET /api/cart | 1 | 1 | `CartController.GetCart()` — returns full cart with items, totals, timestamps. Returns empty cart object (not 404) when no cart exists. |
| POST /api/cart (add item) | 1 | 1 | `CartController.AddToCart()` — creates cart if needed, increments quantity if product already in cart, returns `201 Created`. |
| PUT /api/cart/{cartItemId} (update qty) | 1 | 1 | `CartController.UpdateCartItem()` — updates quantity, checks ownership via `Cart.UserId`, returns 200. |
| DELETE endpoints (item + clear) | 1 | 1 | `DELETE /api/cart/{cartItemId}` removes single item (204). `DELETE /api/cart/clear` removes all items (204). Both implemented. |
| Proper status codes and responses | 1 | 1 | 201 for add, 200 for update/get, 204 for delete, 401 for unauthorized, 404 for not found. All correct. |

**Subtotal: 5 / 5**

---

## 3. Database Persistence (4 / 4)

| Sub-item | Points | Earned | Evidence |
|----------|--------|--------|----------|
| Cart/CartItem EF entities | 2 | 2 | `Cart.cs` with `Id`, `UserId`, `CreatedAt`, `UpdatedAt`, `Items` collection. `CartItem.cs` with `Id`, `CartId`, `ProductId`, `Quantity`, navigation properties. Both use proper data annotations (`[Required]`, `[ForeignKey]`). |
| Relationships and navigation properties | 1 | 1 | `Cart.Items` (ICollection<CartItem>), `CartItem.Cart`, `CartItem.Product` — bidirectional navigation. Foreign keys properly declared. |
| Migrations applied, data persists | 1 | 1 | `20260415212427_InitialSchema` migration creates all tables. Data persists in `BuckeyeMarketplace.db` (SQLite). Verified via API restart — cart data survives. |

**Subtotal: 4 / 4**

---

## 4. Frontend-Backend Integration (5 / 5)

| Sub-item | Points | Earned | Evidence |
|----------|--------|--------|----------|
| Real API replaces mock/localStorage | 2 | 2 | `cartService.ts` makes real API calls via `apiFetch`/`apiJson` from `apiClient.ts`. No localStorage for cart data — cart state comes entirely from the server. |
| All cart operations call API | 2 | 2 | `fetchCart()`, `addToCart()`, `updateCartItem()`, `removeCartItem()`, `clearCart()` — all 5 service functions make HTTP requests to the backend. |
| State synchronization | 1 | 1 | `CartContext` calls `refreshCart()` after every mutation. Auto-refreshes on auth state change via `useEffect` watching `isAuthenticated`. Optimistic updates with server rollback on error. |

**Subtotal: 5 / 5**

---

## 5. Error Handling & UX (3 / 3)

| Sub-item | Points | Earned | Evidence |
|----------|--------|--------|----------|
| Loading states | 1 | 1 | `CartPage.tsx` renders "Loading cart..." spinner when `state.loading` is true. `CheckoutPage.tsx` similarly shows loading state. |
| Error messages and edge cases | 1 | 1 | `CartPage.tsx` handles error state with message + "Back to listings" link. Empty cart shows helpful message + "Browse Products" CTA. API returns structured error messages (`{ message: "Product not found." }`). |
| Success feedback | 1 | 1 | `CartContext` dispatches `SET_NOTIFICATION` on success ("Item added to cart!", "Quantity updated", "Item removed from cart", "Cart cleared"). `Notification.tsx` component renders toast. Auto-clears after 3 seconds. |

**Subtotal: 3 / 3**

---

## 6. Code Quality (3 / 3)

| Sub-item | Points | Earned | Evidence |
|----------|--------|--------|----------|
| Clean component structure | 1 | 1 | Well-organized: `components/` (CartItemCard, CartSummary, Header), `pages/` (CartPage), `context/` (CartContext), `services/` (cartService), `types/`. Single-responsibility components. |
| Service layer / custom hooks | 1 | 1 | `cartService.ts` abstracts all API calls. `apiClient.ts` provides `apiFetch`/`apiJson` with automatic auth header injection. `useCart()` custom hook for context access. |
| AI usage documented | 1 | 1 | `AI-USAGE.md` documents what was used, what was not, and the review workflow. |

**Subtotal: 3 / 3**

---

## Final Score: 25 / 25

### Strengths
- Excellent cart implementation with optimistic updates and rollback — goes beyond basic requirements
- Clean separation: Controller → EF Core entities → DTOs → Frontend service → Context → Components
- Proper ownership checks on all cart endpoints (`Cart.UserId` matched against JWT claim)
- Notification system with auto-dismiss adds polish

### Suggestions for Growth
- Consider adding pagination or virtual scrolling for large cart item lists
- Unit tests for the cart controller/service logic could further strengthen the backend
