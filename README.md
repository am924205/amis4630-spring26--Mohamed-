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
- [Milestone 4: Shopping Cart](#milestone-4-shopping-cart)
  - [Cart Features](#cart-features)
  - [Cart API Endpoints](#cart-api-endpoints)
  - [M4 AI Usage Summary](#m4-ai-usage-summary)

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

**Prerequisites:** .NET SDK 10+ and Node.js 18+ installed.

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

---

## Milestone 4: Shopping Cart

Milestone 4 implements the second vertical slice: a full-stack Shopping Cart. Users can add products to their cart from the listing and detail pages, update quantities, remove items, clear the cart, and see totals update in real time. The cart persists in the database via the .NET API.

### Cart Features

- Cart state managed with `useReducer` + Context API
- Add to cart from both the product listing and detail pages
- Update item quantity (min 1, max 99)
- Remove individual items or clear the entire cart
- Cart item count badge visible in the navigation header
- Calculated subtotals and totals displayed in order summary
- Optimistic UI updates for instant feedback
- Loading states, error messages, and success notifications
- Empty cart state with prompt to browse products
- Cart data persists across page refreshes via database

### Updated Project Structure

```
api/
  Controllers/
    ProductsController.cs       # GET /api/products, GET /api/products/{id}
    CartController.cs           # GET, POST, PUT, DELETE /api/cart
  Models/
    Product.cs                  # Product entity
    Cart.cs                     # Cart entity (user identifier, timestamps)
    CartItem.cs                 # CartItem entity (product reference, quantity)
  Dtos/
    AddToCartRequest.cs         # POST request DTO
    UpdateCartItemRequest.cs    # PUT request DTO
    CartResponse.cs             # Full cart response DTO
    CartItemResponse.cs         # Cart line item response DTO
  Validators/
    AddToCartRequestValidator.cs      # FluentValidation (ProductId > 0, Qty 1-99)
    UpdateCartItemRequestValidator.cs # FluentValidation (Qty 1-99)
  Data/
    AppDbContext.cs             # EF Core context (Products, Carts, CartItems)
  Migrations/                  # EF Core migrations for cart tables

frontend/
  src/
    components/
      Header.tsx               # Site header with cart count badge
      Notification.tsx          # Success/error toast notifications
      ProductCard.tsx           # Product card with Add to Cart button
      ProductList.tsx           # Product grid
      CartItemCard.tsx          # Individual cart line item with qty controls
      CartSummary.tsx           # Order summary sidebar
    context/
      CartContext.tsx           # useReducer + Context for cart state management
    pages/
      ProductListPage.tsx       # Product listing page
      ProductDetailPage.tsx     # Product detail with Add to Cart button
      CartPage.tsx              # Shopping cart page
    services/
      cartService.ts           # API service layer for cart operations
    types/
      Product.ts               # Product TypeScript interface
      Cart.ts                  # Cart and CartItem TypeScript interfaces
    App.tsx                    # Routes and CartProvider setup
    App.css                    # All application styles
```

### Cart API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/cart` | GET | Retrieve cart contents (hardcoded user ID) |
| `/api/cart` | POST | Add item to cart (creates cart if needed, increments qty if exists) |
| `/api/cart/{cartItemId}` | PUT | Update item quantity |
| `/api/cart/{cartItemId}` | DELETE | Remove item from cart |
| `/api/cart/clear` | DELETE | Clear entire cart |

### Database Persistence

- `Cart` and `CartItem` entities defined with EF Core
- Cart-to-Product relationship via navigation properties
- Migrations applied for cart tables (`AddShoppingCart` migration)
- SQLite database persists cart data across sessions
- Cascade delete configured for cart items

### M4 AI Usage Summary

Below is documentation of how AI tools were used during Milestone 4, what was accepted, modified, or rejected, and where I relied on my own judgment.

#### 1. Cart Context and useReducer Pattern

**Prompt:** "Help me set up a React Context with useReducer for managing shopping cart state."

**What I accepted:** The general pattern of using `createContext` with `useReducer` and a provider component. The action types for fetch, set items, and clear were standard patterns.

**What I modified:** I added optimistic UI updates for quantity changes and item removal, which the AI didn't include initially. When a user changes quantity, the UI updates immediately and rolls back if the API call fails. I also added the notification system (success/error toasts) on top of the base state management, since the AI only generated the data state without any user feedback mechanism.

**What I rejected:** The AI suggested storing cart state in localStorage as a fallback. I removed that since the milestone specifically requires backend persistence and says to replace localStorage-only approaches.

#### 2. Cart Service Layer

**Prompt:** "Create a service module for cart API calls using fetch."

**What I accepted:** The basic fetch wrapper functions for each endpoint (GET, POST, PUT, DELETE). The error handling pattern of checking `res.ok` was clean.

**What I modified:** I made the `fetchCart` function return `null` instead of throwing when the API returns 404 (empty cart), since a missing cart is a valid state, not an error. The AI treated 404 as an exception, but in my app flow a new user has no cart until they add their first item.

#### 3. CartItem and CartSummary Components

**Prompt:** "Build a cart item row component with quantity controls and a summary sidebar."

**What I accepted:** The component structure with increment/decrement buttons and a remove button. The summary component layout with subtotal and total rows was straightforward.

**What I modified:** I added the `disabled` states for the quantity buttons (can't go below 1 or above 99) to match my FluentValidation rules on the backend. The AI generated buttons without any limits. I also added `aria-label` attributes for accessibility.

#### 4. Add to Cart from Product Cards

**Where I relied on my own judgment:** The AI placed the "Add to Cart" button outside the `<Link>` wrapper on product cards, which broke the card layout. I kept the button inside the card but used `e.preventDefault()` and `e.stopPropagation()` to prevent the link navigation when clicking the button. This way the card is still fully clickable for navigation, but the Add to Cart button works independently.

#### 5. Navigation Header with Cart Badge

**Prompt:** "Add a site header with navigation links and a cart item count badge."

**What I accepted:** The header layout with logo link and nav links. The badge component showing `totalItems` from cart state.

**What I modified:** I styled the badge as a small circle positioned over the Cart link text using absolute positioning, matching the OSU scarlet color scheme. The AI used a generic blue badge that didn't fit the design system.

#### Overall

AI assisted with boilerplate and standard React patterns. Key decisions I made independently: optimistic UI update strategy, notification system design, 404-as-empty-cart handling, quantity validation alignment with backend rules, accessibility attributes, and all styling choices to maintain the OSU scarlet theme. Every piece of generated code was reviewed, tested with the running API, and modified before committing.
