# Changelog

## Milestone 5 — Authentication, Security & Order Processing

### Added
- **Authentication backend.** ASP.NET Core Identity with `ApplicationUser` (extends `IdentityUser`). New `POST /api/auth/register` and `POST /api/auth/login` endpoints in `AuthController`. JWT generation in `JwtTokenService` — HS256-signed, 120-minute lifetime, key read from user-secrets.
- **Password policy.** Minimum 8 characters, at least one uppercase letter, at least one digit, enforced in both Identity options (`Program.cs`) and FluentValidation (`RegisterRequestValidator`).
- **Role-based authorization.** `Admin` and `User` roles seeded on first run. `DbSeeder` creates one admin (`admin@buckeyemarketplace.com` / `Admin123!`) and one regular user (`user@buckeyemarketplace.com` / `User1234!`).
- **Order placement.** `Order` and `OrderItem` entities, `POST /api/orders` creates an order from the current user's cart, clears the cart, and returns a confirmation number. `GET /api/orders/mine` lists the calling user's history. `GET /api/orders/{id}` returns a single order if and only if it belongs to the caller (or the caller is admin).
- **Admin endpoints.** `POST/PUT/DELETE /api/products`, `GET /api/orders`, and `PUT /api/orders/{orderId}/status` are all gated behind `[Authorize(Roles = "Admin")]`.
- **Frontend auth.** `AuthContext`, `LoginPage`, `RegisterPage`, `ProtectedRoute`. JWT stored in `localStorage` and attached to every API request by `apiClient.ts`.
- **Checkout and order history.** `CheckoutPage`, `OrderConfirmationPage`, `OrderHistoryPage`.
- **Admin UI.** `AdminDashboardPage`, `AdminProductsPage` (CRUD), `AdminOrdersPage` (status dropdown).
- **Tests.** `api.Tests/` xUnit project with 13 unit tests + 3 integration tests against `WebApplicationFactory<Program>` using the EF Core in-memory provider. Jest/RTL tests for validation helpers, the auth reducer, and the login form.
- **End-to-end.** Playwright spec at `frontend/e2e/checkout.spec.ts` covers register → add to cart → checkout → view order history. Prompts and corrections recorded in `docs/e2e-run.md`.

### Security
- JWT signing key is stored in user-secrets, not `appsettings.json`. `Program.cs` refuses to start if the key is missing outside the `Testing` environment.
- All protected endpoints pull the user ID from the JWT's `NameIdentifier`/`sub` claim — no client-supplied user IDs are trusted (mitigates broken object-level authorization, a.k.a. OWASP API1:2023).
- All database access goes through EF Core LINQ, not `FromSqlRaw` with string interpolation (mitigates SQL injection).
- Custom middleware sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy: no-referrer` on every response.
- Passwords are hashed by Identity's default PBKDF2 hasher.

### Changed
- `CartController` now requires authentication and scopes every cart to the caller's JWT subject claim (previously used a hardcoded `default-user`).
- `ProductsController` GETs remain anonymous; all mutations now require the `Admin` role.
- `AppDbContext` extends `IdentityDbContext<ApplicationUser>`.

### Removed
- The hardcoded `CurrentUserId = "default-user"` constant in `CartController`.
- The `App.test.tsx` placeholder test that pointed at copy that no longer exists.

### Known bugs fixed during this milestone
- **In-memory + SQLite provider collision in tests.** The initial integration test run failed with "Services for database providers 'Microsoft.EntityFrameworkCore.Sqlite', 'Microsoft.EntityFrameworkCore.InMemory' have been registered in the service provider." Fixed by guarding the SQLite `AddDbContext<AppDbContext>` registration in `Program.cs` behind `!builder.Environment.IsEnvironment("Testing")`, so the test factory is the sole registrar in that environment.
- **Missing JWT key in the test host.** `JwtTokenService` was throwing "Jwt:Key is not configured" during `POST /api/auth/register` inside `WebApplicationFactory`. Fixed by adding an in-memory configuration source in `TestWebApplicationFactory` that supplies a deterministic test-only key.
