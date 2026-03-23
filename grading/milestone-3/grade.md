# Lab Evaluation Report

**Student Repository**: `am924205/amis4630-spring26--Mohamed-`
**Date**: March 23, 2026
**Rubric**: rubric.md

## 1. Build & Run Status

| Component           | Build | Runs | Notes                                                                                           |
| ------------------- | ----- | ---- | ----------------------------------------------------------------------------------------------- |
| Backend (.NET)      | ✅    | ✅   | `dotnet build` succeeded. Server starts on `http://localhost:5062`.                              |
| Frontend (React/TS) | ✅    | ✅   | `npm run build` compiled successfully. CRA dev server configured via `react-scripts start`.      |
| API Endpoints       | —     | ✅   | `GET /api/products` → 200 (10 items). `GET /api/products/1` → 200. `GET /api/products/999` → 404. |

### Project Structure Comparison

The rubric specifies a solution layout standard of `/backend`, `/frontend`, `/docs`.

| Expected    | Found       | Status |
| ----------- | ----------- | ------ |
| `/backend`  | `/api`      | ❌     |
| `/frontend` | `/frontend` | ✅     |
| `/docs`     | `/docs`     | ✅     |

> The backend directory is named `api` instead of `backend`. This is a deviation from the layout standard but does not affect functionality. No points are deducted per the rubric (layout standard is informational).

## 2. Rubric Scorecard

| #   | Requirement                          | Points | Status  | Evidence                                                                                                                                                                                                                                         |
| --- | ------------------------------------ | ------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | React Product List Page              | 5      | ✅ Met  | `ProductListPage.tsx` — fetches from API, handles loading (L28-30), error (L32-34), and empty states (via `ProductList.tsx` L11-16). Component hierarchy uses `ProductListPage` → `ProductList` → `ProductCard`, following Atomic Design (pages → organisms → molecules). |
| 2   | React Product Detail Page            | 5      | ✅ Met  | `ProductDetailPage.tsx` — separate route at `/products/:id` (`App.tsx` L12). Displays all fields: title, description, price, category, sellerName, postedDate, imageUrl (L53-65). Navigation: back link to list (L52), card links to detail (`ProductCard.tsx` L12). |
| 3   | API Endpoint: GET /api/products      | 5      | ✅ Met  | `ProductsController.cs` L20-24 — returns JSON array via `Ok(products)` with 200 status. SQLite used as data store with EF Core seeding in `Program.cs`. Verified: 200 status, 10 products returned with correct shape.                            |
| 4   | API Endpoint: GET /api/products/{id} | 5      | ✅ Met  | `ProductsController.cs` L26-33 — returns single product by ID with `Ok(product)`, returns `NotFound()` (404) for unknown IDs. Verified: `GET /api/products/1` → 200, `GET /api/products/999` → 404.                                              |
| 5   | Frontend-to-API Integration          | 5      | ✅ Met  | `ProductListPage.tsx` L13 fetches from `http://localhost:5062/api/products`. `ProductDetailPage.tsx` L14 fetches from `http://localhost:5062/api/products/${id}`. No hardcoded data — all from API. Error states handled in both pages.              |

**Total: 25 / 25**

## 3. Detailed Findings

All rubric items are met. No deficiencies to report.

## 4. Action Plan

No corrective actions required — full marks earned.

## 5. Code Quality Coaching (Non-Scoring)

- **Hardcoded API base URL**: `ProductListPage.tsx` and `ProductDetailPage.tsx` both define `const API_BASE = "http://localhost:5062"` inline. Consider moving this to an environment variable or a shared config module so it can be changed for production deployments without editing component files.

- **Backend directory naming**: The backend lives in `/api` while the solution layout standard specifies `/backend`. Aligning with the standard improves consistency and makes it easier for teammates to navigate the repository.

- **CORS origin hardcoded**: `Program.cs` L23 hardcodes `http://localhost:3000` as the allowed CORS origin, but the frontend actually runs on port 3000 by default (CRA). This works, but if the port changes (e.g., 5173), requests will fail silently. Consider using a configuration-driven approach.

- **SQLite connection string hardcoded**: `Program.cs` L13 has the connection string inline. Move it to `appsettings.json` for easier environment-specific configuration.

- **No TypeScript strict mode**: `tsconfig.json` does not enable `strict: true`. Enabling strict mode catches more bugs at compile time.

## 6. Git Practices Coaching (Non-Scoring)

- **Good incremental commits**: The history shows purposeful commits for each milestone phase (M2 docs, M3 vertical slice, cart API). Each commit has a meaningful message describing the change.

- **Single commit for M3 features**: Commit `c9a109b` ("Implement Milestone 3: Product Catalog vertical slice") bundles the entire frontend and API implementation in one commit. Breaking this into smaller commits (e.g., API endpoints, then frontend pages, then integration) would tell a clearer development story and make code review easier.

---

**25/25** — All rubric criteria fully met. The product list page, detail page, both API endpoints, and frontend-to-API integration are all implemented correctly with proper loading, error, and empty states. The coaching notes above (API base URL configuration, directory naming, CORS management, commit granularity) are suggestions for professional growth, not scoring deductions.
