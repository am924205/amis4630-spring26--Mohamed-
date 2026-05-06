# Milestone 5 — Authentication, Security & Order Processing Grade

## 0. Build & Run Status

| Component           | Build | Runs | Notes                                                                                                                      |
| ------------------- | ----- | ---- | -------------------------------------------------------------------------------------------------------------------------- |
| Backend (.NET)      | ✅    | ✅   | `dotnet build` succeeded. `dotnet run` starts after JWT key configured via user-secrets. 17/17 tests pass (`dotnet test`). |
| Frontend (React/TS) | ✅    | ✅   | `npm run build` succeeded. 13/13 tests pass (3 suites: authReducer, validation, LoginForm).                                |
| API Endpoints       | —     | ✅   | Auth login (200, JWT returned), Cart (200 w/ token, 401 w/o), Orders (200 w/ token).                                       |

---

## 1. Authentication Backend (5 / 5)

| Sub-item                         | Points | Earned | Evidence                                                                                                                                                                                                                                                                                          |
| -------------------------------- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Registration and login endpoints | 2      | 2      | `AuthController.cs`: `POST /api/auth/register` creates user via `UserManager`, assigns "User" role, returns JWT. `POST /api/auth/login` validates via `SignInManager.CheckPasswordSignInAsync`, returns JWT. Both return structured `AuthResponse` (token, email, displayName, roles, expiresAt). |
| JWT token generation             | 1      | 1      | `JwtTokenService.cs`: HS256-signed JWT with `sub`, `email`, `NameIdentifier`, `displayName`, `jti`, role claims. 120-minute lifetime. Configurable issuer/audience.                                                                                                                               |
| Password hashing                 | 1      | 1      | Uses ASP.NET Core Identity's default PBKDF2 hasher — `UserManager.CreateAsync` handles hashing. No custom/weak hashing.                                                                                                                                                                           |
| Role-based authorization         | 1      | 1      | `DbSeeder` creates "Admin" and "User" roles. Admin user seeded with both roles. New registrations get "User" role. Role claims embedded in JWT.                                                                                                                                                   |

**Subtotal: 5 / 5**

---

## 2. Protected Endpoints (3 / 3)

| Sub-item                                    | Points | Earned | Evidence                                                                                                                                                                                                                  |
| ------------------------------------------- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JWT middleware configured                   | 1      | 1      | `Program.cs` lines 75–93: JWT Bearer authentication configured with `ValidateIssuer`, `ValidateAudience`, `ValidateLifetime`, `ValidateIssuerSigningKey`. 30-second clock skew.                                           |
| [Authorize] on protected endpoints          | 1      | 1      | `CartController` has class-level `[Authorize]`. `OrdersController` has class-level `[Authorize]`. `ProductsController` GET is `[AllowAnonymous]`, mutations require `[Authorize(Roles = "Admin")]`.                       |
| Admin role enforcement + proper error codes | 1      | 1      | `POST/PUT/DELETE /api/products` and `GET /api/orders` (all) and `PUT /api/orders/{id}/status` require Admin role. Integration test `AdminProductEndpoint_WithUserRole_Returns403` verifies 403. Unauthenticated gets 401. |

**Subtotal: 3 / 3**

---

## 3. Frontend Auth (4 / 4)

| Sub-item                                | Points | Earned | Evidence                                                                                                                                                                                                           |
| --------------------------------------- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Login/registration pages                | 2      | 2      | `LoginPage.tsx` + `LoginForm.tsx` with email/password fields, validation, error display. `RegisterPage.tsx` + `RegisterForm.tsx` with displayName/email/password + inline validation for password rules.           |
| Token storage and auth context          | 1      | 1      | `AuthContext.tsx` with `useReducer` (`authReducer.ts`). Token stored in `localStorage` under `bm.authToken`. User JSON under `bm.authUser`. Hydration on mount from localStorage. Cleared on logout.               |
| Protected routes + auto token inclusion | 1      | 1      | `ProtectedRoute.tsx` checks `isAuthenticated`, redirects to `/login` with `from` state. Admin check with `requireAdmin` prop. `apiClient.ts` auto-injects `Authorization: Bearer` header on every `apiFetch` call. |

**Subtotal: 4 / 4**

---

## 4. Order Flow (5 / 5)

| Sub-item                                 | Points | Earned | Evidence                                                                                                                                                                                                                           |
| ---------------------------------------- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST /api/orders creates order from cart | 2      | 2      | `OrdersController.CreateOrder()` loads cart with items, calls `OrderCalculator.MapCartItemsToOrderItems()` to snapshot product data, creates `Order` entity with confirmation number, removes cart items. Returns `OrderResponse`. |
| Checkout page with shipping form         | 1      | 1      | `CheckoutPage.tsx`: form with address textarea, validation (non-empty required), "Place Order" button with loading state, order summary sidebar showing items and total.                                                           |
| Order confirmation + cart cleared        | 1      | 1      | After successful order, navigates to `/orders/confirmation/{id}` with order state. Cart cleared server-side (cart items removed) and `refreshCart()` called client-side. `OrderConfirmationPage.tsx` shows confirmation number.    |
| Order history page                       | 1      | 1      | `OrderHistoryPage.tsx`: fetches from `GET /api/orders/mine`, displays order cards with confirmation number, status, date, line items, shipping address, total. Empty state handled.                                                |

**Subtotal: 5 / 5**

---

## 5. Admin Features (4 / 4)

| Sub-item                              | Points | Earned | Evidence                                                                                                                                                                                                                  |
| ------------------------------------- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin dashboard with role restriction | 1      | 1      | `AdminDashboardPage.tsx` with navigation cards. Protected by `ProtectedRoute` with `requireAdmin`. Admin link in `Header.tsx` only shown when `isAdmin`.                                                                  |
| Product management CRUD               | 2      | 2      | `AdminProductsPage.tsx`: Create (form + POST), Edit (inline form + PUT), Delete (confirm + DELETE). `ProductsController` has full CRUD with Admin role gate.                                                              |
| Order status management               | 1      | 1      | `AdminOrdersPage.tsx` with status dropdown (Pending/Processing/Shipped/Delivered/Cancelled). `PUT /api/orders/{orderId}/status` with allowed-value validation. Admin `GET /api/orders` shows all orders with user emails. |

**Subtotal: 4 / 4**

---

## 6. Testing & Security (2 / 2)

| Sub-item                                                                              | Points | Earned | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------- | ------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Automated tests pass (3+ backend unit, 1+ integration, 3+ frontend, 1 Playwright E2E) | 1      | 1      | **Backend**: 13 unit tests (PasswordRuleValidator: 7, OrderCalculator: 4, RegisterRequestValidator: 3) + 3 integration tests (AuthIntegrationTests: Cart_WithoutToken_Returns401, RegisterThenGetCart, AdminProductEndpoint_WithUserRole_Returns403). All 17 pass. **Frontend**: 13 tests across 3 suites (authReducer: 5, validation: 5, LoginForm: 3). All pass. **Playwright**: 1 E2E spec (`checkout.spec.ts`) covers register → add to cart → checkout → confirmation → order history.                                      |
| Security practices (3+ from W13 checklist)                                            | 1      | 1      | **(1)** JWT key in user-secrets, not in source — `Program.cs` throws if missing outside Testing env. **(2)** BOLA mitigation — `OrdersController.GetById()` returns 404 (not 403) for cross-user order lookups, all endpoints scope to JWT `NameIdentifier` claim. **(3)** SQL injection mitigation — all DB access via EF Core LINQ, no raw SQL. **(4)** Security headers middleware — `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`. **(5)** Passwords hashed by Identity PBKDF2. |

**Subtotal: 2 / 2**

---

## 7. Code Quality (2 / 2)

| Sub-item                        | Points | Earned | Evidence                                                                                                                                                                                             |
| ------------------------------- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clean organization and patterns | 1      | 1      | Backend: Controllers/Models/Dtos/Services/Validators/Data separation. Frontend: pages/components/context/services/types/utils. Consistent naming conventions. FluentValidation for all request DTOs. |
| AI usage documented             | 1      | 1      | `AI-USAGE.md` thoroughly documents what Claude/Copilot was used for, what was done manually (security decisions, BOLA fix), and the review workflow. Specific and honest.                            |

**Subtotal: 2 / 2**

---

## Final Score: 25 / 25

### Strengths

- Thorough security implementation: BOLA guard, JWT scoping, security headers, secrets management
- Integration tests verify actual security boundaries (401/403 enforcement)
- Clean auth flow with hydration from localStorage and automatic token injection
- `OrderCalculator` service properly snapshots product data into order items, preventing price manipulation

### Suggestions for Growth

- Consider adding refresh token support for better UX on long sessions
- Rate limiting on auth endpoints would further harden against brute-force attacks
- The Playwright E2E spec is solid but could be expanded with admin-flow coverage
