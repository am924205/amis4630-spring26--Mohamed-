# Milestone 6 Submission — Buckeye Marketplace v1.0

## Repository
GitHub: https://github.com/am924205/amis4630-spring26--Mohamed-
Branch graded: **main** (tagged `v1.0`).

## Live application URLs
- **Frontend (Azure Static Web Apps):** https://agreeable-field-09f60e210.7.azurestaticapps.net
- **Backend API (Azure App Service):** https://buckeye-api-mohamed560.azurewebsites.net
- **Swagger / API docs:** https://buckeye-api-mohamed560.azurewebsites.net/swagger

## Test credentials
The seeder (`api/Data/DbSeeder.cs`) creates these accounts on first run against a fresh database:

| Role         | Email                          | Password   |
|--------------|--------------------------------|------------|
| Admin        | admin@buckeyemarketplace.com   | Admin123!  |
| Regular user | user@buckeyemarketplace.com    | User1234!  |

New accounts registered through the UI are assigned the `User` role automatically.

## Documentation
- [README.md](README.md) — full project overview, technology stack, setup, deployment, API docs, AI usage summary.
- [docs/deployment.md](docs/deployment.md) — Azure resource provisioning + GitHub Actions wiring.
- [docs/test-plan.md](docs/test-plan.md) — end-to-end test plan, cross-browser & responsive checks, bugs found and fixed.
- [docs/user-guide.md](docs/user-guide.md) — shopper user guide with screenshots.
- [docs/admin-guide.md](docs/admin-guide.md) — admin user guide.
- [docs/architecture/system-architecture.md](docs/architecture/system-architecture.md) — production + local architecture diagrams (Mermaid).
- [docs/database/erd.md](docs/database/erd.md) — current database ERD.
- [docs/ai-reflection.md](docs/ai-reflection.md) — AI tool reflection (2–3 pages).
- [AI-USAGE.md](AI-USAGE.md) — short AI usage workflow summary.
- [CHANGELOG.md](CHANGELOG.md) — release notes for M5 and M6.

## CI/CD pipelines
- [.github/workflows/ci.yml](.github/workflows/ci.yml) — build + test on every PR.
- [.github/workflows/deploy-api.yml](.github/workflows/deploy-api.yml) — deploy backend to App Service on push to `main`.
- [.github/workflows/deploy-frontend.yml](.github/workflows/deploy-frontend.yml) — deploy frontend to Static Web Apps on push to `main`.

Evidence of green runs: GitHub repo → Actions tab.

## Run the solution locally
```bash
# API
cd api
dotnet user-secrets set "Jwt:Key" "dev-secret-key-buckeye-marketplace-2026-abcdef0123456789-xyz"
dotnet user-secrets set "Jwt:Issuer" "BuckeyeMarketplace"
dotnet user-secrets set "Jwt:Audience" "BuckeyeMarketplaceClient"
dotnet user-secrets set "Jwt:ExpiresMinutes" "120"
dotnet run                # http://localhost:5062

# Frontend (second terminal)
cd frontend
npm install
npm start                 # http://localhost:3000
```

## Test commands
```bash
# Backend unit + integration (xUnit) — 17 tests
dotnet test

# Frontend Jest/RTL — 13 tests
cd frontend && CI=true npm test -- --watchAll=false

# Playwright E2E (requires API + frontend running)
cd frontend
npm install --save-dev @playwright/test
npx playwright install chromium
npx playwright test
```

## Security practices applied (W13 checklist, carried over from M5)
1. **JWT signing key in user-secrets / App Service settings, not source.** `Program.cs` refuses to start without `Jwt:Key` (except in the `Testing` environment).
2. **BOLA guard.** `GET /api/orders/mine` and `GET /api/orders/{id}` resolve the user from the JWT subject claim. Cross-user reads return 404, not 403, to avoid leaking existence.
3. **Role-based authorization.** Admin endpoints are gated with `[Authorize(Roles = "Admin")]`. Verified by `AdminProductEndpoint_WithUserRole_Returns403`.
4. **Parameterized queries via EF Core LINQ.** No `FromSqlRaw` with string interpolation.
5. **Secure response headers.** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`. Re-applied at the SWA edge via `staticwebapp.config.json`.
6. **HTTPS-only on Azure.** Both the App Service and Static Web App enforce HTTPS (Azure terminates TLS).
7. **Identity password hashing (PBKDF2).** Passwords are never stored in plaintext.
8. **CORS scoped per environment.** `Cors:AllowedOrigins` is config-driven; production lists only the SWA URL.

## Pre-submission checklist
- [x] `dotnet build amis4630-spring26--Mohamed-.sln --configuration Release` — 0 errors, 0 warnings related to this project.
- [x] `dotnet test` — 17 pass.
- [x] `CI=true npm test -- --watchAll=false` — 13 pass.
- [x] Frontend `npm run build` produces a clean production bundle.
- [x] Playwright spec committed at [frontend/e2e/checkout.spec.ts](frontend/e2e/checkout.spec.ts).
- [x] No secrets committed (`git grep -i "Jwt:Key" -- ':!SUBMISSION.md' ':!docs/' ':!CHANGELOG.md' ':!AI-USAGE.md'` returns only the configuration-key name).
- [x] Admin user seeded on a fresh database.
- [x] GitHub Actions workflows committed.
- [x] Frontend points at the production API via `REACT_APP_API_URL` (no hardcoded URL in source).
