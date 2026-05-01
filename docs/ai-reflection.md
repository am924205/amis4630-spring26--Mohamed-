# AI Tool Reflection — Buckeye Marketplace

This is the consolidated reflection on how I used AI tools across the full Buckeye Marketplace project (Milestones 1–6). It complements the milestone-specific notes in [README.md](../README.md) and the workflow summary in [AI-USAGE.md](../AI-USAGE.md).

---

## 1. Tools used

| Tool                           | Used for                                                                       |
|--------------------------------|--------------------------------------------------------------------------------|
| **GitHub Copilot** (in-IDE)    | Inline autocomplete while writing C# controllers, React components, and tests  |
| **Claude Code** (`claude-opus-4-6`) | Pair-programming on larger refactors, explaining errors, generating first-draft scaffolds, and editing docs in the terminal |

I treated both as suggestion engines. Every line that landed in `main` was reviewed, built, and tested locally before it was committed.

---

## 2. How I used AI across the SDLC

### Requirements & design (Milestones 1–2)

- I drafted the prioritized feature list, ADRs, and component breakdowns myself.
- Claude was used to **rewrite for clarity** — for example, I'd write a paragraph for an ADR and ask "tighten this without changing the decision," then accept word-level edits and reject anything that introduced a new claim.
- For the Mermaid diagrams in `docs/architecture/system-architecture.md` and `docs/database/erd.md`, I sketched the entities by hand, then asked Claude for the Mermaid syntax. I corrected the cardinalities (the first draft put a one-to-many between `USER` and `CART`; I changed it to one-to-one).

### Implementation (Milestones 3–5)

- **Scaffolding.** Claude generated the initial shape of `ProductsController`, `CartController`, `AuthController`, `OrdersController`, the `Order` / `OrderItem` / `ApplicationUser` models, the `JwtTokenService`, and the `DbSeeder`. I reviewed each draft against the milestone spec before saving.
- **Frontend plumbing.** First drafts of `AuthContext`, `apiClient.ts`, and `ProtectedRoute` came from Claude. I rewrote the optimistic-update behavior in the cart reducer myself because the AI version dropped state on error.
- **Copilot autocomplete** carried most of the boilerplate-heavy code: TypeScript types from `Product.ts`, EF Core fluent-API setup in `AppDbContext`, and FluentValidation rules.

### Testing (Milestones 5–6)

- Claude proposed first versions of every xUnit test in `api.Tests/`. I kept the tests that exercised real logic (`PasswordRuleValidatorTests`, `OrderCalculatorTests`, the integration test that asserts a regular-user token gets `403` from the admin endpoint) and discarded any test that was only asserting the mock.
- The Playwright spec at `frontend/e2e/checkout.spec.ts` was generated through Copilot agent mode in VS Code and then hand-corrected; the prompts and corrections are recorded in [docs/e2e-run.md](e2e-run.md).

### Deployment & docs (Milestone 6)

- The three GitHub Actions workflows (`ci.yml`, `deploy-api.yml`, `deploy-frontend.yml`) were drafted with Claude, then I tightened them: I narrowed the `paths:` filters, removed `continue-on-error: true` from the test step (the lab template included it, but tests now actually pass), and split the build artifact upload from the deploy job.
- The README, user guide, admin guide, deployment guide, and test plan are my own writeups. I used Claude to suggest section headings and to catch inconsistencies between docs (it caught that the README listed Postgres while the actual DB was SQLite/Azure SQL — I'd missed updating the M1 placeholder).

---

## 3. Specific prompts and outcomes

### Prompt — JWT integration test setup
> "Help me figure out why my integration test fails with 'Services for database providers Microsoft.EntityFrameworkCore.Sqlite, Microsoft.EntityFrameworkCore.InMemory have been registered'."

**Outcome:** Claude explained that EF Core can't resolve two providers in the same DI container and pointed me at the `IsEnvironment("Testing")` guard pattern. I implemented the guard in `Program.cs` myself and added a deterministic `Jwt:Key` to `TestWebApplicationFactory` so the JWT service stops throwing under test.

### Prompt — CORS for production
> "My SWA frontend gets CORS errors hitting the API. The API has app.UseCors with a hardcoded localhost origin. What's the cleanest way to make this configurable per-environment without hardcoding the SWA URL in source?"

**Outcome:** Claude suggested binding `Cors:AllowedOrigins` from configuration. I implemented it and set the value in App Service Application settings rather than committing the SWA URL.

### Prompt — Static Web Apps deep-link 404
> "Hard-refreshing /cart on the deployed SWA returns 404. Localhost handles it fine. Why?"

**Outcome:** Claude explained that SWA serves static files and doesn't know about the React Router routes, then suggested `staticwebapp.config.json` with a `navigationFallback` rule. I added the file with the routes from the lab handout plus `globalHeaders` for the security headers.

### Prompt — SQLite migrations on Azure SQL
> "Will my existing EF Core migrations apply against Azure SQL if I switch the provider to SqlServer?"

**Outcome:** Claude said no — the migrations have SQLite-flavored column types like `TEXT` and `Sqlite:Autoincrement` annotations. It suggested either generating SQL Server-specific migrations or calling `EnsureCreatedAsync` for the SQL Server provider in production. I picked the latter for v1.0 because regenerating migrations would have churned the local SQLite dev story; that trade-off is documented in `DbSeeder.cs`.

---

## 4. What worked well

- **Boilerplate and ceremony.** Identity wiring, JWT handler configuration, CORS, FluentValidation registration — all of this is extremely well-trodden, and AI saved real time on it.
- **Explaining error messages.** EF Core and ASP.NET Core errors can be cryptic; "explain this stack trace and what changed when this started failing" worked consistently.
- **Refactoring for consistency.** Claude was good at applying a pattern (e.g., "make every cart endpoint pull the user id from the JWT subject claim instead of hardcoded 'default-user'") across multiple files in one pass.
- **Documentation polish.** Spotting inconsistencies (Postgres vs. SQLite, mismatched table-of-contents anchors, stale references to old milestones) was something AI did well as a second pair of eyes.

## 5. What did **not** work well

- **Over-eager test generation.** First-draft AI tests were often thin wrappers around mocks: they asserted nothing real about my code. I had to rewrite or delete them and write the test that actually pinned the behavior. Hitting the rubric's test count is easy with AI; hitting it with tests that catch regressions is not.
- **Fabricating APIs.** A few times Claude suggested a method or option that doesn't exist on the version I'm using (an EF Core 7-era extension method on EF Core 10, an `azure/static-web-apps-deploy@v2` that's actually @v1). I caught these only because the build failed.
- **Security defaults.** AI defaulted to `AllowAnyOrigin()` for CORS and `AllowAnyMethod` everywhere — fine in a tutorial, wrong for production. I overrode every default and kept the origin list as narrow as possible.
- **Forgetting the spec.** When I'd been chatting for a while, the assistant would drift back to generic patterns even when the project already had a different convention. I had to re-anchor it ("we already use FluentValidation for cart DTOs — match that pattern").

## 6. Impact on productivity and learning

I'd estimate the project shipped **~30–40% faster** than it would have if I'd written every line from scratch — most of the savings on boilerplate, test scaffolding, and second-pass doc editing rather than on the hard problems. The hard problems (the BOLA fix on `/api/orders/{id}`, the in-memory + SQLite provider collision in tests, the SQLite-vs-SQL-Server migration mismatch) were all things I had to *understand* to fix correctly; AI was a faster path to a hypothesis but never the final answer.

On the learning side, the most useful thing was treating the assistant as a Socratic tutor: "explain what `[Authorize(Roles = ...)]` actually does at runtime", "walk through what `WebApplicationFactory` is replacing", "what is BOLA and why is it OWASP API1:2023?" The explanations stuck better than the generated code did.

## 7. Lessons learned about AI-assisted development

1. **The reviewer always wins.** Code that I wrote line-by-line and code that AI wrote both ship the same way: through me reading the diff. The bottleneck is review quality, not generation speed.
2. **Tests catch fabricated APIs.** The CI pipeline (build + test on every push) is what keeps AI hallucinations out of `main`. If I'd been merging without CI, several of those imaginary APIs would have shipped.
3. **Architecture stays with the human.** Every important decision in this repo — secrets in user-secrets, BOLA scoping, role-based authorization, picking SQLite-locally / Azure-SQL-in-prod — was mine. AI implemented those decisions but did not make them.
4. **Don't let it write your essays.** Reflections and AI usage docs need to be honest about what *I* did vs. what the assistant did. Generating this very document with AI and then claiming it as my reflection would defeat the assignment. So I drafted the section headings, wrote the substance, and used Claude only to copy-edit for tone.

---

## Appendix — what the assistant **never** had access to

- Real user passwords or PII (only the seeded throwaway test credentials in `SUBMISSION.md`)
- The Azure publish profile or any other production secret
- Live database contents
- Any value I would not be comfortable showing my instructor
