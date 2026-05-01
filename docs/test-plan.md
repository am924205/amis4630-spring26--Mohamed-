# Buckeye Marketplace — End-to-End Test Plan (Milestone 6)

This is the test plan I executed against the deployed Azure environment before submitting Milestone 6. It covers user flows, admin flows, cross-browser checks, mobile responsiveness, and the bugs uncovered while testing.

---

## 1. Scope and environments

| Layer    | Environment under test                                  |
|----------|---------------------------------------------------------|
| Frontend | Azure Static Web Apps — `https://agreeable-field-09f60e210.7.azurestaticapps.net` |
| Backend  | Azure App Service — `https://buckeye-api-mohamed560.azurewebsites.net`       |
| Database | Azure SQL Database — `BuckeyeMarketplaceDb` (Basic tier) |
| CI/CD    | GitHub Actions workflows in `.github/workflows/`        |

**Test data**

| Role  | Email                              | Password   |
|-------|------------------------------------|------------|
| Admin | admin@buckeyemarketplace.com       | Admin123!  |
| User  | user@buckeyemarketplace.com        | User1234!  |

A second user (`testbuyer+m6@buckeyemarketplace.com` / `Buyer1234!`) was registered through the UI during testing.

---

## 2. Automated test coverage

These tests run in CI on every push to `main`:

| Suite                         | Command                                | Count |
|-------------------------------|----------------------------------------|-------|
| Backend xUnit unit tests      | `dotnet test`                          | 13    |
| Backend xUnit integration     | `dotnet test`                          | 4     |
| Frontend Jest / RTL           | `CI=true npm test -- --watchAll=false` | 13    |
| Playwright happy-path E2E     | `npx playwright test`                  | 1     |

The Playwright spec at `frontend/e2e/checkout.spec.ts` exercises register → browse → add to cart → checkout → confirmation → order history end to end.

---

## 3. User flow test cases

| ID  | Flow                                | Steps                                                                                                                              | Expected result                                                                                  | Result |
|-----|-------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|--------|
| U-01 | Browse products (anonymous)        | Open the site → land on `/`                                                                                                       | Product grid renders, all 10 seeded items visible, no auth prompt                                | Pass   |
| U-02 | View product detail (anonymous)    | Click any product card                                                                                                            | Detail page shows title, price, description, seller, category, image                              | Pass   |
| U-03 | Register new account                | `/register` → fill form with valid email/password → submit                                                                        | 200 response, JWT stored, redirect to `/`, header shows logged-in state                          | Pass   |
| U-04 | Login existing account              | `/login` → submit valid credentials                                                                                               | 200 response, JWT stored, redirect to `/`                                                        | Pass   |
| U-05 | Login wrong password                | `/login` → submit invalid password                                                                                                | 401, "Invalid email or password" inline error, no token persisted                                | Pass   |
| U-06 | Add to cart                         | Logged-in user clicks "Add to Cart" on a product card                                                                             | Cart badge increments to 1, success toast, item visible at `/cart`                               | Pass   |
| U-07 | Update cart quantity                | `/cart` → click + on a row                                                                                                        | Quantity increments, line subtotal and order total update, button disabled at 99                  | Pass   |
| U-08 | Remove cart item                    | `/cart` → click Remove                                                                                                            | Row disappears, totals recalculate, badge decrements                                              | Pass   |
| U-09 | Empty cart state                    | Remove all items                                                                                                                  | Empty-cart message + "Browse products" CTA, badge hidden                                          | Pass   |
| U-10 | Checkout success                    | `/cart` → "Proceed to Checkout" → enter shipping address → "Place Order"                                                          | 200 response, order confirmation page with confirmation number, cart is cleared                   | Pass   |
| U-11 | Checkout validation                 | `/checkout` → submit with empty address                                                                                           | Inline error, no order created                                                                    | Pass   |
| U-12 | Order history                       | `/orders` after placing an order                                                                                                  | New order appears at top with status "Pending", confirmation number, total                       | Pass   |
| U-13 | Logout                              | Header → Logout                                                                                                                   | JWT cleared, redirect to `/`, protected pages prompt for login                                    | Pass   |
| U-14 | Protected route gate                | Visit `/cart` while logged out                                                                                                    | Redirect to `/login` with `from` redirect target                                                  | Pass   |

---

## 4. Admin flow test cases

| ID  | Flow                                 | Steps                                                                                  | Expected result                                                              | Result |
|-----|--------------------------------------|----------------------------------------------------------------------------------------|------------------------------------------------------------------------------|--------|
| A-01 | Admin gate enforcement              | Logged-in regular user navigates to `/admin`                                          | Redirect to `/` (or login), no admin UI rendered                            | Pass   |
| A-02 | Admin login                         | Login as `admin@buckeyemarketplace.com`                                               | "Admin" link visible in header, `/admin` accessible                          | Pass   |
| A-03 | Create product                      | `/admin/products` → "New product" → fill required fields → save                       | New product appears in list and on the public catalog                        | Pass   |
| A-04 | Edit product                        | `/admin/products` → edit row → save                                                  | Updated values reflected on the public catalog                               | Pass   |
| A-05 | Delete product                      | `/admin/products` → delete a test product                                             | Product removed from catalog, no broken cart references                      | Pass   |
| A-06 | View all orders                     | `/admin/orders`                                                                       | All orders across users visible with user identifier and current status      | Pass   |
| A-07 | Update order status                 | `/admin/orders` → change status dropdown                                              | Status persists; user sees updated status in their order history             | Pass   |
| A-08 | Admin endpoints reject user JWT     | curl `POST /api/products` with regular user JWT                                       | 403 Forbidden                                                                | Pass   |
| A-09 | Admin endpoints reject anon         | curl `POST /api/products` with no Authorization header                                | 401 Unauthorized                                                             | Pass   |
| A-10 | BOLA guard on order detail         | curl `GET /api/orders/{otherUserOrderId}` with user JWT                                | 404 Not Found (does not leak existence)                                      | Pass   |

---

## 5. Cross-browser testing

| Browser              | Version    | OS         | Result                                                     |
|----------------------|------------|------------|------------------------------------------------------------|
| Chrome               | 134        | macOS 25   | Pass — all flows                                            |
| Firefox              | 134        | macOS 25   | Pass — all flows                                            |
| Safari               | 18.3       | macOS 25   | Pass — all flows; minor cosmetic differences on focus rings |
| Edge                 | 134        | Windows 11 | Pass — all flows                                            |

---

## 6. Mobile responsiveness

Tested via Chrome DevTools device emulation and a real iPhone 14 (Safari) and Pixel 7 (Chrome).

| Breakpoint | Devices                       | Notes                                                             | Result |
|------------|-------------------------------|-------------------------------------------------------------------|--------|
| ≤ 480 px   | iPhone SE, Galaxy S8          | Product grid collapses to one column, header buttons wrap cleanly | Pass   |
| 481–768 px | iPhone 14, Pixel 7            | Two-column grid, cart sidebar stacks below items                   | Pass   |
| 769–1024 px| iPad mini                     | Three-column grid, admin tables scroll horizontally               | Pass   |
| ≥ 1025 px  | Desktop                       | Four-column grid, full layout                                     | Pass   |

Touch targets verified to be at least 44×44 px on phones (Add to Cart button, quantity controls, header links).

---

## 7. Bugs found and fixed during testing

| #  | Symptom                                                                 | Root cause                                                                                                                        | Fix                                                                                                                                            |
|----|-------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| 1  | First production deploy returned 500 on every request                  | Connection string was set as an App Setting instead of a Connection String entry, so EF Core read `null` and tried SQLite locally | Re-set `DefaultConnection` under App Service → Configuration → **Connection strings** with type `SQLAzure`                                     |
| 2  | Frontend received CORS errors after first deploy                       | API only allowed `http://localhost:3000`                                                                                          | Added `Cors:AllowedOrigins` config array, set to the SWA URL in App Service Application settings, and `app.UseCors("AllowReactApp")` reads it |
| 3  | Hard-refresh on `/cart` returned 404 on Static Web Apps                 | SWA didn't know to fall back to `index.html` for client-side routes                                                               | Added `frontend/staticwebapp.config.json` with `navigationFallback`                                                                            |
| 4  | First admin login failed with 500 after switching to Azure SQL          | Schema didn't exist yet; the existing migrations are SQLite-flavored                                                              | `DbSeeder` now picks `EnsureCreatedAsync` for the SQL Server provider and `MigrateAsync` for SQLite                                            |
| 5  | Frontend showed `Failed to fetch` after deployment                      | `apiClient.ts` had `http://localhost:5062` hardcoded                                                                              | Switched to `process.env.REACT_APP_API_URL`, set in `.env.production`                                                                          |
| 6  | GitHub Actions deploy step failed with "no publish profile"             | Repo secret was named `AZURE_PUBLISH_PROFILE` while workflow expected `AZURE_API_PUBLISH_PROFILE`                                 | Renamed the secret in GitHub repo settings                                                                                                     |

---

## 8. Definition of done

A change is considered "done" only when:

1. `dotnet test` and `npm test -- --watchAll=false` pass locally.
2. The change passes the GitHub Actions CI workflow on the PR.
3. The change deploys cleanly via the production workflow.
4. The flow it touches has been re-tested end to end against the deployed URLs.
5. Any user-visible behavior is reflected in the README or the user guide.
