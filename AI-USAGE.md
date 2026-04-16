# AI Usage — Milestone 5

I used Claude Code (Anthropic's CLI assistant, model `claude-opus-4-6`) as a pair-programming collaborator while implementing Milestone 5. It was treated the same way I would treat Copilot: a suggestion engine whose output I review and accept or reject. I wrote the milestone-level design, the security decisions, and the acceptance criteria; the assistant generated first-draft code that I then validated against the rubric and the W13 material.

## What I used it for
- **Scaffolding.** Generated the initial shape of `AuthController`, `OrdersController`, the `ApplicationUser`/`Order`/`OrderItem` models, the `JwtTokenService`, and the `DbSeeder` based on the Week 12/13 lectures on ASP.NET Core Identity + JWT.
- **Frontend plumbing.** Drafted the `AuthContext` reducer, the `apiClient` fetch wrapper that attaches the `Authorization: Bearer ...` header, and the `ProtectedRoute` component.
- **Tests.** Suggested the first versions of the xUnit tests and the Jest/RTL tests. I kept the tests that exercised real project logic (password rules, order calculator, register-request validator, auth reducer transitions, login-form empty-submit error) and removed anything that was only testing the mock.
- **Debugging.** When `dotnet test` failed with the "two database providers registered" error, I asked the assistant to explain EF Core's internal service provider rules, then made the fix in `Program.cs` myself.

## What I did *not* use it for
- **Security decisions.** The choice to put the JWT key in user-secrets, scope `/api/orders/mine` to the JWT subject claim, and return 404 (not 403) for cross-user order lookups was mine, based on the W13 OWASP/BOLA lecture. The assistant implemented those decisions once I specified them.
- **Passwords or credentials.** No real credentials were pasted into the assistant. The test credentials committed to `SUBMISSION.md` are throwaway seed values used only for grading.
- **Grading-related content.** I did not ask the assistant to estimate my grade, fabricate tests to meet a floor, or hit the rubric's bullet counts without genuine coverage. Every test here exercises real logic.

## Review workflow
For each change:
1. I wrote the goal and any constraints ("use Identity's PBKDF2 — do not roll our own hasher").
2. The assistant proposed code.
3. I read every diff, ran `dotnet build` / `dotnet test` / `npm test` locally, and only committed after the relevant tests passed on my machine.
4. When behavior looked wrong (e.g., the Playwright selectors matching multiple elements), I corrected the selector myself and recorded the correction in `docs/e2e-run.md`.

## Tools and files the assistant touched
All changes are visible in this milestone's commits. The assistant had no network access beyond package restores and did not make outbound calls to external services on my behalf.
