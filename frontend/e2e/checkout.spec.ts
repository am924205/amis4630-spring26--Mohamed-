import { test, expect } from "@playwright/test";

// Happy-path E2E: register -> login is implicit on register -> browse -> add to cart -> checkout -> view order in history.
// Prereqs:
//   - API running at http://localhost:5062 (dotnet run in ./api)
//   - Frontend running at http://localhost:3000 (npm start in ./frontend)

test("user can register, add to cart, check out, and see the order in history", async ({ page }) => {
  const unique = Date.now();
  const email = `e2e-${unique}@osu.edu`;
  const password = "Abcdef12";

  // 1) Register (registration auto-logs-in in this app)
  await page.goto("/register");
  await page.getByLabel(/display name/i).fill("E2E Tester");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /create account/i }).click();

  await expect(page.getByRole("heading", { name: /buckeye marketplace/i })).toBeVisible();

  // 2) Browse catalog and add first product to the cart.
  const firstAddButton = page.getByRole("button", { name: /add to cart/i }).first();
  await firstAddButton.click();

  // 3) Go to cart and proceed to checkout.
  await page.getByRole("link", { name: /^cart/i }).click();
  await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible();
  await page.getByRole("link", { name: /proceed to checkout/i }).click();

  // 4) Enter shipping address and place order.
  await page.getByLabel(/address/i).fill("123 High St, Columbus, OH 43210");
  await page.getByRole("button", { name: /place order/i }).click();

  // 5) Confirmation page should show a confirmation number.
  await expect(page.getByText(/confirmation number/i)).toBeVisible();

  // 6) Navigate to order history and see the order.
  await page.getByRole("link", { name: /view order history/i }).click();
  await expect(page.getByRole("heading", { name: /my orders/i })).toBeVisible();
  await expect(page.getByText(/BM-/)).toBeVisible();
});
