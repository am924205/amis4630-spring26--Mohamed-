# Milestone 5 Submission — Buckeye Marketplace

## Repository
Submitted via LMS: https://github.com/am924205/sp-26-cartworkshop
Main branch: **main**. Grader should pull `main` and run the steps below.

## Test credentials
The seeder (`api/Data/DbSeeder.cs`) creates these accounts on first run against a fresh database:

| Role        | Email                                | Password     |
|-------------|--------------------------------------|--------------|
| Admin       | admin@buckeyemarketplace.com         | Admin123!    |
| Regular user| user@buckeyemarketplace.com          | User1234!    |

New accounts registered through the UI are assigned the `User` role automatically.

## User secrets (graders: set these locally)
The JWT signing key is **not** committed to the repo. Run from the `api/` folder before starting the API:

```bash
dotnet user-secrets set "Jwt:Key" "dev-secret-key-buckeye-marketplace-2026-abcdef0123456789-xyz"
dotnet user-secrets set "Jwt:Issuer" "BuckeyeMarketplace"
dotnet user-secrets set "Jwt:Audience" "BuckeyeMarketplaceClient"
dotnet user-secrets set "Jwt:ExpiresMinutes" "120"
```

(These are the same values I used locally. They are shared here only because the grader requested them in the submission guidelines — they are **not** committed anywhere in the repository.)

## Run the solution locally
```bash
# API
cd api
dotnet user-secrets set "Jwt:Key" "dev-secret-key-buckeye-marketplace-2026-abcdef0123456789-xyz"
dotnet run                # listens on http://localhost:5062

# Frontend (in a second terminal)
cd frontend
npm install
npm start                 # opens http://localhost:3000
```

## Test commands
```bash
# Backend unit + integration tests (xUnit)
dotnet test                       # 17 tests pass

# Frontend unit/component tests (Jest + React Testing Library)
cd frontend
CI=true npm test -- --watchAll=false   # 13 tests pass

# End-to-end (Playwright) — requires API and frontend running
cd frontend
npm install --save-dev @playwright/test
npx playwright install chromium
npx playwright test                    # runs e2e/checkout.spec.ts
```

## Security practices applied (W13 checklist)

1. **JWT signing key stored in user secrets, not `appsettings.json`.** Program.cs refuses to start if `Jwt:Key` is missing (except in the `Testing` environment). Running `git grep -i "Jwt:Key"` returns no secret values, only the configuration-key name.
2. **Broken-object-level-authorization (BOLA) guard on orders.** `GET /api/orders/{id}` and `GET /api/orders/mine` resolve the user ID from the JWT's `NameIdentifier`/`sub` claim rather than trusting a path/query parameter. Non-admin requests for another user's order return 404, not 403 (to avoid leaking existence).
3. **Role-based authorization on admin endpoints.** `[Authorize(Roles = "Admin")]` on product create/update/delete and on the order list/status-update endpoints. Regular users get a 403, as verified by the `AdminProductEndpoint_WithUserRole_Returns403` integration test.
4. **Parameterized queries via LINQ/EF Core.** All DB access goes through `DbSet<T>` and LINQ — no `FromSqlRaw` with string interpolation, so there is no SQL-injection surface.
5. **Secure response headers.** Custom middleware sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy: no-referrer` on every response.
6. **ASP.NET Core Identity for password hashing.** Passwords are never persisted in plaintext — Identity's default hasher (PBKDF2 with per-user salt) is used. The password policy enforces 8+ chars, one uppercase, and one digit both on the server (Identity options) and on the client (`utils/validation.ts`).

## AI usage
See [AI-USAGE.md](./AI-USAGE.md) — documents how Claude Code was used for scaffolding, refactoring, and debugging throughout this milestone.

## Pre-submission checklist
- [x] `dotnet build` — no warnings related to this project.
- [x] `dotnet test` — 17 pass (13 unit + 3 integration + 1 controller/service test).
- [x] `CI=true npm test -- --watchAll=false` — 13 tests pass.
- [x] Playwright spec committed at `frontend/e2e/checkout.spec.ts`.
- [x] No secrets committed (`git grep -i "Jwt:Key" -- ':!SUBMISSION.md' ':!AI-USAGE.md' ':!CHANGELOG.md'` returns only the configuration-key name).
- [x] Admin user seeded on a fresh database.
