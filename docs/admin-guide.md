# Buckeye Marketplace — Admin Guide

This guide is for users with the **Admin** role. It covers the two admin responsibilities in the v1.0 release: managing the product catalog and managing customer orders.

> **Admin login:** sign in with the seeded admin account (`admin@buckeyemarketplace.com` / `Admin123!`) or any account that has been promoted to the Admin role in the database.

---

## 1. Reaching the admin dashboard

1. Sign in.
2. If your account has the Admin role, an **Admin** link appears in the header.
3. Click it to land on the admin dashboard at `/admin`.
4. The dashboard has two cards:
   - **Manage Products** → `/admin/products`
   - **Manage Orders** → `/admin/orders`

If you sign in as a regular user, the Admin link is hidden and any direct navigation to `/admin*` redirects you home. Calls to admin API endpoints with a regular-user token return a `403`; calls with no token return a `401`.

---

## 2. Managing products

Path: `/admin/products`

The page shows every product in the catalog as an editable row.

### Create a product

1. Click **New product**.
2. Fill in title, description, price, category, seller name, and image URL.
3. Click **Save**. The product appears in the table and on the public catalog immediately.

### Edit a product

1. Click **Edit** on the row you want to change.
2. Update any field. Numbers are validated client-side (price must be ≥ 0).
3. Click **Save**. The change is persisted immediately.
4. Click **Cancel** to abandon the edit.

### Delete a product

1. Click **Delete** on the row.
2. Confirm in the dialog. Deletion is permanent.
3. The product disappears from the table and the public catalog.

> Deleting a product does **not** delete it from existing orders — `OrderItem` snapshots the unit price at order time, so historical orders stay intact even if the underlying product is later removed.

---

## 3. Managing orders

Path: `/admin/orders`

The page lists every order across every customer with the most recent first. Each row shows:

- Confirmation number
- User email
- Order date
- Total
- Current status (dropdown)

### Update an order's status

1. Pick a new value from the **Status** dropdown:
   - `Pending` (default after checkout)
   - `Processing`
   - `Shipped`
   - `Delivered`
   - `Cancelled`
2. The change is saved automatically when the dropdown closes.
3. The customer sees the updated status the next time they load **My Orders**.

There is no email notification yet — customers find out by reloading their order history. That's a planned post-v1.0 enhancement.

### Inspect an order's line items

Click the row to expand and see the line items: product title, quantity, unit price (snapshot at order time), and per-line subtotal.

---

## 4. Security model (for context)

- Every admin endpoint is gated by `[Authorize(Roles = "Admin")]`. The xUnit integration test `AdminProductEndpoint_WithUserRole_Returns403` verifies that a regular-user JWT receives `403` from `POST /api/products`.
- Order detail lookups for non-admins are scoped to the JWT's `NameIdentifier` — admins can read any order, regular users can only read their own. Cross-user lookups by a regular user return `404` (not `403`) so the API doesn't leak which order ids exist.
- All connections go over HTTPS; Azure terminates TLS in front of both the Static Web App and the App Service.

---

## 5. Troubleshooting

| Symptom                                                | What to try                                                                 |
|--------------------------------------------------------|------------------------------------------------------------------------------|
| Admin link does not appear after login                 | The account is missing the Admin role; check `AspNetUserRoles` in the DB    |
| Saving a product returns "Validation failed"          | Inspect the inline error; price must be ≥ 0, image URL must be a valid URL  |
| Status change reverts on refresh                       | Confirm the API responded `200`; check the App Service log stream for errors |
| 403 on admin endpoints from a known admin account      | The token expired (default lifetime 120 minutes); sign out and back in       |
