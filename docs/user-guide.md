# Buckeye Marketplace — User Guide

Welcome to Buckeye Marketplace, the OSU-only platform for buying and selling among students. This guide walks through everything a regular shopper does on the site: browsing, signing up, adding items to a cart, checking out, and reviewing past orders.

> **Live site:** https://agreeable-field-09f60e210.7.azurestaticapps.net

---

## 1. Browsing products

You can browse the catalog without signing in.

1. Open the home page. The product grid loads automatically.
2. Each card shows the title, price, category, and seller name.
3. Click any card to open the **product detail page**, which shows the full description, image, and seller information.

![Product list](screenshots/Buckeye%20ProductList.png)

![Product detail](screenshots/Buckeye%20ProductDetail.png)

---

## 2. Creating an account

Before you can add items to a cart, place an order, or see order history, you'll need an account.

1. Click **Register** in the header.
2. Enter your name, OSU email, and a password.
3. Passwords must be **at least 8 characters** and include **one uppercase letter** and **one digit**. The form will explain inline if your password doesn't meet the rules.
4. Submit. You'll be signed in automatically and dropped on the home page with a logged-in header.

If you already have an account, click **Login** instead and enter your email and password. Wrong credentials show an inline error and do **not** lock the account.

---

## 3. Adding items to your cart

1. From any product card, click **Add to Cart**.
2. The cart badge in the header increments and a confirmation toast appears in the corner.
3. Open **Cart** in the header to review your items.
4. On the cart page you can:
   - Use **+ / −** to change a line's quantity (1–99).
   - Click **Remove** to delete a line.
   - Click **Clear Cart** to empty the cart entirely.
5. The order summary on the right updates in real time.

If you sign out and back in, your cart is restored from the server — it doesn't live in your browser.

---

## 4. Placing an order (checkout)

1. From the cart page, click **Proceed to Checkout**.
2. Enter your shipping address. The form requires a non-empty address.
3. Review the order total and click **Place Order**.
4. On success you'll see the **order confirmation page** with a unique confirmation number and a summary of what you ordered. Your cart will be empty after a successful order.
5. If something fails (network error, validation error), the page shows an inline error and **no order is created**.

---

## 5. Viewing your order history

1. Click **My Orders** in the header (visible when you're signed in).
2. Each row shows:
   - Order date and confirmation number
   - Current status (Pending, Processing, Shipped, Delivered, Cancelled)
   - Order total
3. Click an order to expand its line items.
4. Status changes are made by an admin and update on this page automatically the next time you load it.

---

## 6. Logging out

Click **Logout** in the header. Your session token is cleared from the browser; you'll be returned to the home page. Protected pages (cart, checkout, orders) will redirect you to the login screen until you sign in again.

---

## 7. Troubleshooting

| Symptom                                            | What to try                                                           |
|----------------------------------------------------|------------------------------------------------------------------------|
| "Invalid email or password" on login              | Re-enter the password — passwords are case-sensitive                  |
| Add to Cart appears to do nothing                  | Make sure you're signed in (header should say your name)              |
| Page is stuck on a spinner                         | Refresh the tab; if it persists, the API may be cold-starting (~10s)  |
| Cart shows old items after switching accounts      | Refresh the page so the app re-fetches the current user's cart        |

For anything else, contact the site admin.
