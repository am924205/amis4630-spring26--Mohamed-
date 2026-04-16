# Playwright E2E Run Notes

## Prompts given to the Copilot-style agent
1. "Generate a Playwright happy-path spec for this app covering register -> browse -> add to cart -> checkout -> view order in history. Use `@playwright/test`. Use role-based locators where possible."
2. "The product list page buttons are all labeled 'Add to Cart'; pick the first one. The cart link shows 'Cart' plus an optional badge — match it with a regex."
3. "After registration, the app auto-navigates home. Don't try to log in again. Follow the 'Proceed to Checkout' CTA to the checkout form."

## First-attempt mistakes the agent made
- Used `page.getByText("Cart")` which matched multiple elements (the header link and the badge). Fixed by scoping to the link role and anchoring with a regex (`/^cart/i`).
- Tried to locate the checkout button with `name: /checkout/i` — this also matched the page heading. Replaced with `name: /proceed to checkout/i` to disambiguate.
- Assumed the shipping input was an `<input>`; it is actually a `<textarea>`. `getByLabel(/address/i)` still matched, so no code change was needed, but I had to confirm that manually.

## How to re-run
Requires the API at http://localhost:5062 and the CRA dev server at http://localhost:3000. Then:

```
cd frontend
npm install --save-dev @playwright/test
npx playwright install chromium
npx playwright test
```
