# Changelog

## Milestone 6 — Production Deployment (v1.0)

### Added
- **Azure deployment.** Frontend on Azure Static Web Apps, backend on Azure App Service (Linux, .NET 10), database on Azure SQL Database (Basic). HTTPS terminated by Azure.
- **CI/CD pipelines.** GitHub Actions workflows: `ci.yml` (build + test on PRs), `deploy-api.yml` (deploy backend on push to main), `deploy-frontend.yml` (deploy frontend on push to main).
- **Production-ready configuration.**
  - API picks SQL Server when the connection string targets Azure SQL, SQLite otherwise.
  - `Cors:AllowedOrigins` is bound from configuration so each environment supplies its own frontend origin.
  - Frontend reads `REACT_APP_API_URL` from env and falls back to `http://localhost:5062` for local dev.
- **Static Web Apps configuration.** `frontend/staticwebapp.config.json` adds `navigationFallback` (so deep links survive a refresh) and re-applies the API's security headers at the edge.
- **Environment files.** `frontend/.env.production` (committed; non-secret) and `frontend/.env.example` (template for local overrides).
- **Documentation.**
  - Comprehensive Milestone 6 section in [README.md](README.md) with stack table, env vars, API table, and deployment summary.
  - [docs/deployment.md](docs/deployment.md) — Azure CLI runbook + GitHub Actions wiring.
  - [docs/test-plan.md](docs/test-plan.md) — full E2E test plan (user/admin flows, cross-browser, responsive, bugs fixed).
  - [docs/user-guide.md](docs/user-guide.md) — shopper guide.
  - [docs/admin-guide.md](docs/admin-guide.md) — admin guide.
  - [docs/ai-reflection.md](docs/ai-reflection.md) — consolidated AI usage reflection across SDLC.
  - Updated [docs/architecture/system-architecture.md](docs/architecture/system-architecture.md) and [docs/database/erd.md](docs/database/erd.md) to reflect the production system.

### Changed
- `Program.cs` reads `DefaultConnection` (Azure-style key) before falling back to the legacy `Default` key.
- `DbSeeder` calls `EnsureCreatedAsync` for the SQL Server provider (production) and `MigrateAsync` for SQLite (local), so the SQLite-flavored migrations don't run against Azure SQL.
- `apiClient.ts` reads the API base URL from `process.env.REACT_APP_API_URL` instead of a hardcoded `http://localhost:5062`.

### Security
- HTTPS enforced on both the frontend and backend via Azure platform settings.
- `staticwebapp.config.json` re-applies `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy` at the CDN edge in addition to the API middleware.
- All deployment secrets (Azure publish profile, SWA deployment token) live in GitHub repo secrets — never in source.
- CORS narrowed to the production SWA origin only; localhost is dropped from the allow list in production by configuration.

---

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
