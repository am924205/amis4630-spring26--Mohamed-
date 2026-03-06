# Buckeye Marketplace -- ACCTMIS 4630

## Summary

Buckeye Marketplace is an OSU-only marketplace platform designed to improve safety, communication, and discovery for student buying and selling. It addresses major pain points identified in Milestone 1 including scattered listings, ghosting, lack of verification, and no transaction tracking.

---

## Table of Contents

- [Summary](#summary)
- [Kanban Board](#kanban-board)
- [Prioritized Features](#prioritized-features)
- [System Architecture](#system-architecture)
- [Database ERD](#database-erd)
- [Architecture Decision Records](#architecture-decision-records)
- [Component Architecture](#component-architecture-atomic-design)
- [Milestone 3: Product Catalog](#milestone-3-product-catalog)
  - [How to Run Locally](#how-to-run-locally)
  - [Screenshots](#screenshots)
  - [AI Usage Summary](#ai-usage-summary)

---

## Kanban Board

GitHub Project Board: https://github.com/users/am924205/projects/2

---

## Prioritized Features

### Must (MVP / Launch)
- User Registration & Login (OSU Email)
- Product Catalog
- Search & Filters
- Create Listing
- Buyer-Seller Messaging
- Mark as Sold
- Report Listings
- Admin Dashboard
- Cloud Deployment

### Should (Next)
- Saved/Favorited Items
- Reviews and Ratings
- Suggested Meetup Locations
- Edit Listing

### Could (Later)
- Notifications
- Dark Mode
- Listing Analytics
- Price Options (OBO / Fixed)
- User Profiles

---

## System Architecture

See: [docs/architecture/system-architecture.md](docs/architecture/system-architecture.md)

---

## Database ERD

See: [docs/database/erd.md](docs/database/erd.md)

---

## Architecture Decision Records

See: [docs/adr/](docs/adr/)

---

## Component Architecture (Atomic Design)

See: [docs/components/product-catalog-atomic-design.md](docs/components/product-catalog-atomic-design.md)

---

## Milestone 3: Product Catalog

Milestone 3 implements the first vertical slice of Buckeye Marketplace: a working Product Catalog with a React frontend consuming a .NET Web API. Users can browse all product listings and click into any product to view its full details.

### Project Structure

```
api/                        # .NET Web API
  Controllers/
    ProductsController.cs   # GET /api/products, GET /api/products/{id}
  Models/
    Product.cs              # Product data model
  Program.cs                # App config with CORS

frontend/                   # React (TypeScript)
  src/
    components/
      ProductCard.tsx        # Card component (title, price, category, seller)
      ProductList.tsx        # Grid of ProductCard components
    pages/
      ProductListPage.tsx    # Fetches all products from API
      ProductDetailPage.tsx  # Fetches single product by ID from API
    types/
      Product.ts             # TypeScript interface for Product
    App.tsx                  # React Router setup
    App.css                  # Application styles
```

### How to Run Locally

**Prerequisites:** .NET SDK 8+ and Node.js 18+ installed.

**1. Start the .NET API (Terminal 1):**
```bash
cd api
dotnet run
```
The API will be available at `http://localhost:5062`.

**2. Start the React Frontend (Terminal 2):**
```bash
cd frontend
npm install
npm start
```
The app will open at `http://localhost:3000`.

**API Endpoints:**
| Endpoint | Method | Description |
|---|---|---|
| `/api/products` | GET | Returns all products (JSON array) |
| `/api/products/{id}` | GET | Returns a single product by ID, or 404 |

### Screenshots

**Product List Page:**

![Product List Page](docs/screenshots/Buckeye%20ProductList.png)

**Product Detail Page:**

![Product Detail Page](docs/screenshots/Buckeye%20ProductDetail.png)

---

### AI Usage Summary

Below is documentation of how AI tools were used during Milestone 3, what was accepted, modified, or rejected, and where I relied on my own judgment.

#### 1. Scaffolding the .NET ProductsController

**Prompt:** "Create a .NET Web API controller for products with GET all and GET by ID endpoints using an in-memory list."

**What I accepted:** The basic controller structure with `[ApiController]` and `[Route]` attributes, and the two endpoint methods. The pattern of using `FirstOrDefault` for the single-product lookup was straightforward and I kept it.

**What I modified:** I rewrote the sample product data entirely. The AI generated generic placeholder products ("Product 1", "Product 2") that didn't feel like real marketplace listings. I replaced them with OSU-relevant items across Textbooks, Electronics, Furniture, and Clothing categories with realistic descriptions.

**What I rejected:** The AI suggested adding PUT and DELETE endpoints. I removed those since Milestone 3 only requires read operations, and the instructions say to keep it scoped to the vertical slice.

#### 2. Generating the Product Data Model

**Prompt:** "What fields should a product model have for a campus marketplace?"

**What I accepted:** The core fields (id, title, description, price, category) matched the milestone requirements.

**What I modified:** I added `sellerName` and `postedDate` specifically because the milestone spec lists them as required fields. The AI didn't include those initially. I also used `decimal` for price instead of `double` to avoid floating-point precision issues with currency.

#### 3. React Component Structure

**Prompt:** "Help me set up React Router with a product list and detail page."

**What I accepted:** The routing setup with `BrowserRouter`, `Routes`, and `Route` was standard React Router v6 and worked correctly. I also kept the `useParams` approach for the detail page.

**What I modified:** I restructured the components to match the Atomic Design hierarchy from my Milestone 2 docs. The AI put everything in one file initially. I split it into `ProductCard` (organism), `ProductList` (organism), `ProductListPage` (page), and `ProductDetailPage` (page) to follow my component architecture from M2.

**What I rejected:** The AI suggested using a state management library (Redux). That's overkill for two pages fetching data, so I used simple `useState` and `useEffect` hooks instead.

#### 4. CSS Styling

**Prompt:** "Style a product card grid with a scarlet and gray color scheme."

**What I accepted:** The CSS grid layout with `auto-fill` and `minmax` for responsive cards. The hover effect with `translateY` was a nice touch.

**What I modified:** I changed the color values to OSU scarlet (`#bb0000`) instead of the generic red the AI suggested. I also simplified the card styling -- the AI had too many nested shadows and gradients that felt over-designed.

#### 5. CORS Configuration

**Where I relied on my own judgment:** The AI initially suggested `AllowAnyOrigin()` for CORS, but I scoped it to `http://localhost:3000` specifically. Even though this is a development setup, I wanted to follow the practice of restricting origins rather than opening it up to everything.

#### Overall

AI was primarily used as a productivity tool for scaffolding boilerplate code and getting syntax right. All architectural decisions (component hierarchy, data model fields, endpoint scoping, styling choices) were made by me based on the Milestone 2 architecture docs and the Milestone 3 requirements. I reviewed and tested every piece of generated code before committing.
