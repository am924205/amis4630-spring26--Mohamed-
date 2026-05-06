# Milestone 6 — Production Deployment Grade

## 0. Build & Run Status

| Component           | Build | Runs | Notes                                                                     |
| ------------------- | ----- | ---- | ------------------------------------------------------------------------- |
| Backend (.NET)      | ✅    | ✅   | `dotnet build` succeeded. `dotnet run` starts cleanly. 17/17 tests pass.  |
| Frontend (React/TS) | ✅    | ✅   | `npm run build` succeeded (optimized production build). 13/13 tests pass. |
| API Endpoints       | —     | ✅   | All endpoints verified locally (Products, Auth, Cart, Orders).            |

---

## 1. Production Deployment (5 / 5)

| Sub-item                            | Points | Earned | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Application deployed and accessible | 2      | 2      | Frontend on Azure Static Web Apps: `https://agreeable-field-09f60e210.7.azurestaticapps.net`. Backend on Azure App Service: `https://buckeye-api-mohamed560.azurewebsites.net`. Both URLs documented in `SUBMISSION.md`.                                                                                                                                                                                                             |
| HTTPS configured                    | 1      | 1      | HTTPS enforced by Azure platform on both Static Web Apps and App Service. `staticwebapp.config.json` re-applies security headers at the CDN edge. API middleware adds `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`.                                                                                                                                                                                                |
| Professional setup                  | 2      | 2      | Azure SQL Database (Basic tier) for production data. Separate resource group (`rg-buckeye-marketplace`). Connection strings as Azure SQL type (not app settings). CORS narrowed to production SWA origin. `REACT_APP_API_URL` configured via environment. `DbSeeder` uses `EnsureCreatedAsync` for SQL Server, `MigrateAsync` for SQLite — handles provider differences. `navigationFallback` in SWA config for client-side routing. |

**Subtotal: 5 / 5**

---

## 2. CI/CD Pipeline (4 / 4)

| Sub-item                     | Points | Earned | Evidence                                                                                                                                                                                                                                     |
| ---------------------------- | ------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CI workflow                  | 1.5    | 1.5    | `.github/workflows/ci.yml`: Triggers on push/PR to main. Two parallel jobs — backend (dotnet restore → build → test) and frontend (npm ci → test → build).                                                                                   |
| API deployment workflow      | 1.25   | 1.25   | `.github/workflows/deploy-api.yml`: Triggers on push to main (path-filtered to `api/**`). Builds, tests, publishes, uploads artifact, deploys to Azure App Service via publish profile. Deploy gated by `ENABLE_AZURE_DEPLOY` variable.      |
| Frontend deployment workflow | 1.25   | 1.25   | `.github/workflows/deploy-frontend.yml`: Triggers on push to main (path-filtered to `frontend/**`). Builds, tests, produces optimized bundle, deploys to Azure Static Web Apps via SWA token. Also supports PR previews and manual dispatch. |

**Subtotal: 4 / 4**

---

## 3. Testing & QA (4 / 4)

| Sub-item                           | Points | Earned | Evidence                                                                                                                                                                                                                                                    |
| ---------------------------------- | ------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Comprehensive automated test suite | 2      | 2      | 17 backend tests (13 unit + 3 integration + 1 registration validator). 13 frontend tests (authReducer, validation, LoginForm). 1 Playwright E2E spec (full checkout flow). All pass on fresh clone.                                                         |
| Test plan documented               | 1      | 1      | `docs/test-plan.md`: 14 user flow test cases (U-01 through U-14), 10 admin flow test cases (A-01 through A-10), cross-browser testing (Chrome, Firefox, Safari, Edge), mobile responsiveness (4 breakpoints), 6 bugs found and fixed. All marked "Pass".    |
| QA process and bug tracking        | 1      | 1      | Test plan documents 6 production bugs found and fixed (CORS errors, SWA 404, SQL Server migration mismatch, hardcoded API URL, wrong secret name, connection string type). Root cause and fix documented for each. Definition of done criteria established. |

**Subtotal: 4 / 4**

---

## 4. Technical Documentation (5 / 5)

| Sub-item                   | Points | Earned | Evidence                                                                                                                                                                                                                                                                                                                             |
| -------------------------- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Architecture documentation | 1.5    | 1.5    | `docs/architecture/system-architecture.md`: Updated for M6 with technology table, Mermaid diagrams for both production and local dev architectures, key design choices explained (stateless API, CORS config, provider-aware EF Core, defense in depth, secrets isolation).                                                          |
| Deployment documentation   | 1.5    | 1.5    | `docs/deployment.md`: Comprehensive 9-section runbook — prerequisites, resource provisioning (resource group, SQL server, SQL database, App Service, Static Web App), configuration (connection strings, JWT, CORS), manual smoke test, GitHub Actions wiring with secrets table, verification steps. Azure CLI commands throughout. |
| Database documentation     | 1      | 1      | `docs/database/erd.md` with current ERD. ADRs in `docs/adr/` (tech stack, authentication, cloud deployment).                                                                                                                                                                                                                         |
| README and changelog       | 1      | 1      | `README.md` comprehensive with stack table, setup instructions, API table, deployment summary. `CHANGELOG.md` with detailed M5 and M6 entries covering additions, changes, and security items. `SUBMISSION.md` with live URLs, test credentials, setup commands, and test commands.                                                  |

**Subtotal: 5 / 5**

---

## 5. User Documentation (4 / 4)

| Sub-item    | Points | Earned | Evidence                                                                                                                                                                                                                                                         |
| ----------- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User guide  | 2      | 2      | `docs/user-guide.md`: 7-section guide covering browsing, account creation, adding to cart, checkout, order history, logout, and troubleshooting. Screenshots included (`Buckeye ProductList.png`, `Buckeye ProductDetail.png`). Clear step-by-step instructions. |
| Admin guide | 2      | 2      | `docs/admin-guide.md`: 5-section guide covering admin dashboard access, product management (create/edit/delete), order status management, security model explanation, and troubleshooting table. Professional and thorough.                                      |

**Subtotal: 4 / 4**

---

## 6. AI Reflection (3 / 3)

| Sub-item                                     | Points | Earned | Evidence                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------- | ------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Insightful reflection with specific examples | 1.5    | 1.5    | `docs/ai-reflection.md`: 7-section consolidated reflection. Section 3 provides 4 specific prompt-outcome examples (JWT integration test, CORS for production, SWA deep-link 404, SQLite migrations on Azure SQL) with concrete details about what the AI suggested and what the student decided.                                                                                                               |
| Deep analysis of AI impact                   | 1.5    | 1.5    | Section 4 ("What worked well") and Section 5 ("What did not work well") provide honest, specific assessments: AI was good at boilerplate/ceremony/error explanation but bad at over-eager test generation, fabricating APIs, and insecure defaults. Section 6 estimates 30–40% productivity gain. Section 7 synthesizes 4 lessons learned. The reflection is clearly written by the student, not AI-generated. |

**Subtotal: 3 / 3**

---

## Final Score: 25 / 25

### Strengths

- Professional-grade deployment with proper Azure resource provisioning, environment-aware configuration, and path-filtered CI/CD workflows
- Exceptionally thorough test plan with 24 manual test cases, cross-browser testing, mobile responsiveness checks, and documented bug fixes
- Documentation suite is comprehensive and internally consistent — deployment runbook alone could serve as a reference for other students
- AI reflection is genuinely insightful with specific, honest examples; stands out for acknowledging limitations and lessons learned
- Deployment guard (`ENABLE_AZURE_DEPLOY` variable) prevents accidental deploys — thoughtful CI/CD design

### Suggestions for Growth

- Consider adding health check endpoints for production monitoring
- Staging environment with PR preview deploys (partially supported by the SWA workflow) could catch production issues earlier
- Application Insights or equivalent telemetry would complete the production story
