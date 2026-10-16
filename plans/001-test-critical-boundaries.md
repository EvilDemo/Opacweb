# Plan 001: Establish tests for server boundaries and checkout

> Executor instructions: Read this entire plan, follow the steps, and record evidence for each verification. This is a local implementation plan, not authorization to commit, push, open a PR, deploy, publish, delete external data, or change external configuration. Update this plan's row in `plans/README.md` when finished. Preserve unrelated edits.
>
> Drift check: Run `git status --short`, `git diff --stat 17af3a2..HEAD -- 'tests/helpers/load-typescript.mjs' 'tests/checkout.test.mjs' 'tests/cart-actions.test.mjs' 'tests/webhook-boundaries.test.mjs' 'tests/cart-state.test.mjs'`, and `git diff --stat -- 'tests/helpers/load-typescript.mjs' 'tests/checkout.test.mjs' 'tests/cart-actions.test.mjs' 'tests/webhook-boundaries.test.mjs' 'tests/cart-state.test.mjs'` before editing. Compare the excerpts below against the live files. Changes explicitly produced by the listed prerequisites are expected; verify their stated contracts and retain them. Stop on unexplained behavior drift, rather than restoring the old excerpts.

## Status

- **Audit finding**: 6 — critical behavior lacks coverage
- **Priority**: P1
- **Effort**: M (S = hours; M = approximately a day, including verification)
- **Risk**: LOW — tests only; production behavior stays unchanged
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `17af3a2`, 2026-10-15, Europe/Lisbon
- **Status**: DONE

## Why this matters

The existing suite proves optimistic cart arithmetic and locking, but not the server behavior that handles cookies, redirects, and incoming webhooks. Establish a small deterministic harness before the security and recovery fixes, then let each later plan add the regression cases it owns. This plan must pass on current behavior without asserting that the identified bugs are correct.

## Current state and conventions

Repository: `/Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb`. This is a private Next.js App Router application using TypeScript, React, pnpm, Sanity, and Shopify. Imports use `@/` for the repository root. There are no repository design/intent documents or additional checked-in agent instructions to override the supplied personal working agreements. Match existing local style; do not introduce a new application framework.

`tests/cart-state.test.mjs:6–13` already compiles a TypeScript source file with the installed compiler and imports it in memory:
```js
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
```
Its tests use `node:test`, strict assertions, synthetic carts, and deferred promises rather than sleeps. Keep that runner; a new test framework is unnecessary.

`app/checkout/page.tsx:18–21`:
```ts
const { cart, error } = await getCartAction();
if (error) redirect("/cart");
if (!cart || cart.lines.length === 0 || !cart.checkoutUrl) redirect("/shop");
redirect(cart.checkoutUrl);
```
`lib/shopify/actions.ts:9–12` exposes `{ cart: Cart | null; error: string | null }`. `getCartAction` reads the `cart_id` cookie; it clears an expired cart cookie. `app/api/sanity-webhook/route.ts:27–29` rejects a missing signature; Shopify's route rejects missing server configuration and invalid signatures. Those are legitimate existing contracts to characterize.

## Commands you will need

Run from the repository root. The audit verified lint, non-emitting TypeScript, and all four original tests passing. Build and browser checks have not been established by the audit.

| Purpose | Command | Expected result |
|---|---|---|
| Lint | `pnpm lint` | Exit 0, zero warnings |
| Types without writing compiler state | `pnpm exec tsc --noEmit --incremental false` | Exit 0, no diagnostics |
| Unused locals/parameters | `pnpm exec tsc --noEmit --incremental false --noUnusedLocals --noUnusedParameters` | Exit 0 |
| Tests | `pnpm test` | Exit 0; original four tests and applicable new tests pass |
| Production build, when required below | `pnpm build` | Exit 0; no suppression of errors or weakened checks |
| Run product locally, when required below | `pnpm dev` | Server reports ready; use its actual available localhost port |
| Review scope | `git diff --name-status` and `git status --short` | Only this plan's allowed changes, prerequisites, and preserved user edits |

Never print `.env` contents, credentials, customer carts, CMS documents, or raw production logs. Tests use synthetic fixtures and fake secrets. Missing build configuration is an unmet verification gate, not a passing build.

## Scope

**Allowed files** (new files are explicitly identified in the steps):

- `tests/helpers/load-typescript.mjs`
- `tests/checkout.test.mjs`
- `tests/cart-actions.test.mjs`
- `tests/webhook-boundaries.test.mjs`
- `tests/cart-state.test.mjs`
- `plans/README.md`

This plan file may also receive status/completion-evidence updates only. Every other file is out of scope. Preserve prerequisite edits outside this allowlist; their existence does not authorize further edits to those files. Do not format unrelated files, upgrade unrelated dependencies, redesign UI, or change public behavior beyond the contract below.

## Git workflow

Remain in the current checkout unless the operator requests isolation. If a branch is explicitly requested later, use `codex/test-critical-boundaries`. Do not create commits, push, open a PR, or deploy as part of this plan. Existing history includes conventional messages such as `refactor: clean up website and improve mobile loading`, but message style does not authorize committing.

## Steps

### Step 1: Add a bounded in-memory module loader

Create `tests/helpers/load-typescript.mjs`. Load the real requested `.ts`/`.tsx` file, compile with the project's TypeScript compiler to CommonJS/React JSX, and evaluate it with an explicit per-test dependency map. Forward `Request`, `Response`, `Headers`, `URL`, `Buffer`, and shared `Error` constructors where needed. Use only fixture environment values, and fail immediately for imports not explicitly mocked or allowlisted. Do not copy production functions into tests or make requests to Shopify/Sanity. Treat this as test isolation, not a security sandbox.

**Verify:** `node --check tests/helpers/load-typescript.mjs` exits 0; the first tests below import actual production files through the helper.

### Step 2: Characterize checkout and cart reads

Create `tests/checkout.test.mjs` and `tests/cart-actions.test.mjs`. Mock `redirect` with a distinct sentinel and assert its destination; use a complete synthetic cart. Mock `next/headers`, `next/cache`, and `./cart` for actions. Assert no-cookie reads, successful reads, expired-cart cookie clearing, and upstream read failure. Preserve the original four tests; refactor their loader only if needed for consistent reuse.

**Verify:** `node --test tests/checkout.test.mjs tests/cart-actions.test.mjs tests/cart-state.test.mjs` passes without network access.

### Step 3: Exercise actual webhook denial boundaries

Create `tests/webhook-boundaries.test.mjs`. For Sanity, assert a request without a signature is denied with no invalidation. For Shopify, assert missing configuration and invalid signatures cause no cache/path calls. Use the real `next/server` response implementation if convenient, explicit mock cache functions, and per-test module/environment instances. Keep tests for the insecure Sanity nonempty-header path and invalid cache profile in the fixing plans rather than blessing current behavior.

**Verify:** `node --test tests/webhook-boundaries.test.mjs` and `pnpm test` pass; then run lint and non-emitting typecheck.

## Test plan

- Checkout: error → `/cart`; absent cart, empty cart, or absent checkout URL → `/shop`; populated valid cart → its synthetic checkout URL.
- Cart reads: absent cookie makes no provider call; valid cookie returns the cart; confirmed null cart clears the cookie; provider error returns an error without inventing a replacement cart.
- Webhooks: denial results make zero invalidation calls.
- Use `tests/cart-state.test.mjs` as the node:test/assert/deferred-fixture exemplar. No snapshots of source text, production network access, or new dependencies.

## Done criteria

- [x] All three new boundary test files run under the existing `pnpm test` glob.
- [x] Tests import production modules and assert observable results, cookie effects, redirects, or denial behavior.
- [x] No production code or package manifest changes.
- [x] Module state, environment values, and mock call histories do not leak between tests.
- [x] Required lint, type, and test commands above pass; record commands actually run separately from checks not run.
- [x] Scope review confirms unrelated edits were preserved.
- [x] Update this plan's Status and the matching `plans/README.md` row; record any remaining verification limitations.

## STOP conditions

- If native module loading demands a dependency/runner migration, stop and propose the smaller test-isolation alternative rather than adding a toolchain.
- If checkout fixtures show a production defect beyond the documented findings, record it; do not change checkout behavior in this tests-only plan.
- Unexpected source drift, a required change outside the allowed files, or two failed verification attempts without a new explanation: stop and report the exact failure and remaining work.
- Do not bypass a failed gate with ignored diagnostics, disabled tests, arbitrary sleeps, invented external-usage evidence, or exposed credentials.

## Maintenance notes

Plans 003–006 extend these tests or their helper; this is not a request for an arbitrary coverage percentage. Keep provider and Next cache effects explicitly controlled. Add CI or browser automation only as a separately scoped follow-up if needed.

## Completion evidence

Implemented against `17af3a2` on 2026-10-15; verified with Node `v24.21.0` and pnpm `12.11.2`.

- Added the in-memory TypeScript loader and three boundary test files. Each load has its own module state, fixture environment, dependency map, and mock histories. Undeclared imports are denied; this is test isolation, not a security sandbox.
- Added 19 cases: six checkout redirects, five cart-read/recovery-boundary cases, and eight webhook/loader boundary cases. Webhook tests use actual Next HTTP responses and Node crypto with synthetic data. The signed unsupported-topic control demonstrates real Shopify verification without encoding the known invalid-cache-profile bug as desired behavior.
- `node --check tests/helpers/load-typescript.mjs`: passed.
- `node --test tests/checkout.test.mjs tests/cart-actions.test.mjs tests/cart-state.test.mjs`: 15 passed.
- `node --test tests/webhook-boundaries.test.mjs`: 8 passed.
- `pnpm test`: 23 passed, 0 failed, 0 skipped. Full final output: `/private/tmp/opac-plan-001-tests.log`.
- `pnpm lint`: passed with zero warnings. Output: `/private/tmp/opac-plan-001-lint.log`.
- `pnpm exec tsc --noEmit --incremental false --noUnusedLocals --noUnusedParameters`: passed without diagnostics; includes the normal non-emitting typecheck and additional unused checks. Output: `/private/tmp/opac-plan-001-types.log`.
- Scope self-review: four new files under `tests/`; production source, package manifest, lockfile, and the original four tests unchanged. Only this plan's status/evidence and its index row were updated within the existing planning files. No commits, external changes, or provider requests.
- Not run: production build and browser flows. This plan changes tests only and does not establish deployed behavior. Security/cache/cart mutation fixes remain in later plans.
