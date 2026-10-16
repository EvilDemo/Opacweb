# Plan 011: Preserve the displayed cart when refresh fails

> Executor instructions: Implement this local plan, run its verification gates, and update its Status and the matching `plans/README.md` row. Preserve all existing work. This plan does not authorize a commit, push, PR, deployment, real customer-cart mutation, or purchase.
>
> Drift check first: run `git status --short`, `git diff --stat 17af3a2..HEAD -- components/commerce/CartContext.tsx components/commerce/CartPageClient.tsx components/commerce/CartSidebar.tsx`, and the same scoped `git diff --stat` without the commit range. Read the current files against the excerpts below. The working tree already contains plans 001–010 and the WebGL fix; commit `17af3a2` alone does not contain them. Preserve those edits. Reconcile documented predecessor changes; stop on unexplained behavior drift.

## Status

- **Finding**: Pre-existing transient cart-read errors are displayed as an empty cart.
- **Priority**: P2
- **Effort**: M — provider state, two UI surfaces, deterministic regressions, browser verification
- **Risk**: MED — shared client cart state
- **Confidence**: HIGH — reproduced with the actual provider and cart-page rendering against a synthetic failed read
- **Depends on**: existing test loader and completed conservative server recovery/cookie policy from plans 001, 005, 008
- **Category**: bug
- **Planned at**: commit `17af3a2` plus the existing audit working tree, 2026-10-16, Europe/Lisbon
- **Status**: DONE

## Why this matters

When an existing cart refresh fails, the browser discards its last successful snapshot and says the cart is empty. The provider cart and cookie survive, but the customer cannot tell that their items still exist. Preserve the last successful snapshot and make a failed read visibly retryable, including when the first read fails before any cart has loaded.

## Current state and conventions

Repository: `/Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb`. Private Next.js 16.3.8 App Router application, React 19.2.4, TypeScript, pnpm 12.11.2. Imports use `@/` for the root. Match existing `Button`, text classes, and separate data/UI cart contexts; no redesign or context consolidation.

`components/commerce/CartContext.tsx:34–53` owns reads and the last successful snapshot:

```tsx
const result = await getCartAction();
if (result.error) {
  setError(result.error);
  setCart(null);
} else {
  setCart(result.cart);
}
// The catch branch also sets an error and calls setCart(null).
```

`CartPageClient.tsx:10–35` and `CartSidebar.tsx:16,66–84` consume the same context but ignore `error`/`refreshCart`. After loading, null or zero lines always produces `Your cart is empty`. `useCartMutations.ts:44–46` calls `refreshCart()` after a failed mutation; preserve its serialization, rollback, toast, and no-automatic-mutation-retry behavior. `getCartAction()` returns `{ cart, error }`; only an error-free result is authoritative, including a successful null result which must clear an expired cart.

Tests use `node:test` with the installed TypeScript compiler and `tests/helpers/load-typescript.mjs`. `tests/aoty-cross.test.mjs` demonstrates invoking actual TSX with controlled hook dependencies. Such a harness can verify state transitions, but cannot establish real React effect scheduling or optimistic rollback; the browser gate below is separate and required.

## Commands you will need

| Purpose | Command | Expected result |
|---|---|---|
| Focused regressions | `node --test tests/cart-context.test.mjs tests/cart-display.test.mjs` | All pass after the fix |
| Existing cart behavior | `node --test tests/cart-state.test.mjs tests/cart-actions.test.mjs tests/cart-api.test.mjs tests/cart-operations.test.mjs tests/cart-query.test.mjs` | All pass |
| Full tests | `pnpm test` | All pass; baseline before these plans is 195 |
| Lint | `pnpm lint` | Exit 0, zero warnings |
| Types and unused locals | `pnpm exec tsc --noEmit --incremental false --noUnusedLocals --noUnusedParameters` | Exit 0 |
| Production build | `pnpm build` | Exit 0 |
| Whitespace | `git diff --check` | Exit 0 |

## Scope

Only modify:

- `components/commerce/CartContext.tsx`
- `components/commerce/CartPageClient.tsx`
- `components/commerce/CartSidebar.tsx`
- `tests/cart-context.test.mjs` and `tests/cart-display.test.mjs` (new)
- `plans/011-preserve-cart-display-on-refresh-errors.md` (status/evidence), `plans/011-cart-display-verification.md` (new evidence), and `plans/README.md`

Do not change provider/action/API contracts, `useCartMutations.ts`, mutation locking, cookie lifetime, checkout rules, prices, shop flags, UI primitives, dependencies, or public assets. Keep the distinct cart hooks. A test-only application/SDK responder may live under a disposable temporary directory; do not add fixture routes to the real app.

## Git workflow

Stay in the current checkout and preserve unrelated edits. No branch/commit is needed. If the operator separately requests a branch, use `codex/preserve-cart-display`. Commit/push/release actions need their own authorization.

## Steps

### Step 1: Prove read failure differs from confirmed absence

Add deterministic tests invoking the actual provider with a controlled `getCartAction` dependency. Use deferred promises to hold a read in flight, then explicitly settle it; do not use sleeps. Start with a populated two-line cart, then return an error or reject. Assert the last successful snapshot and quantities survive, `error` is set, and loading ends. Also cover first-load failure, successful retry with updated quantities, successful null clearing, successful empty cart, and successful reads clearing a prior error. Assert failures do not trigger an add, replacement, or mutation retry.

For presentation tests, render actual cart page/drawer components with controlled context results and lightweight dependencies using the existing loader/React packages. Test rendered copy, items, retry controls, and error-vs-empty precedence rather than source strings, state-slot numbers, or setter counts. Do not add a test library just for this change.

**Verify:** `node --test tests/cart-context.test.mjs tests/cart-display.test.mjs` fails on the existing empty-on-error behavior before implementation. Record the relevant failing assertions; unrelated loader failures are not a valid red baseline.

### Step 2: Retain snapshots and make read errors visible

In `refreshCart`, set an error on a failed result or rejection, but do not replace `cart`. Continue updating the snapshot on every error-free result, including null. Preserve loading cleanup. No automatic retry or additional provider call is added.

Both UI surfaces must consume the existing context error/refresh function. After loading, show a concise accessible read-error message with an explicit `Retry` button. Use safe customer-facing copy, not raw SDK details. With a retained cart, keep its items/count/totals visible alongside the message. With no snapshot, show the unavailable/retry state instead of claiming emptiness. Error-free null/zero-line results still render the existing empty state. Disable the retry control during loading; invoking it calls only `refreshCart`. Keep current checkout and mutation availability rules unchanged.

**Verify:** the focused regressions and existing cart command above exit 0. A successful null still clears the previous UI cart; a failed read never masquerades as a successful null.

### Step 3: Verify actual React recovery in a running product

Run all repository gates. Use an enabled-shop local production fixture with the current provider, mutation hook, cart page/drawer, navigation, and action code copied unchanged; replace only the Shopify SDK boundary with synthetic state. Never use a live cart. Run installed Next directly in fixtures (`node <repository>/node_modules/next/dist/bin/next build --webpack` and `start --hostname 127.0.0.1 --port <free-port>`); do not run pnpm install/scripts against a symlinked `node_modules`, which previously caused React-type drift.

Exercise a loaded two-line cart; an add/update failure followed by a failed refresh; retained items/count and inline retry on the page and drawer; retry success clearing the error; first-load failure without an empty claim; and a successful confirmed-null read reaching the genuine empty state. Verify quantity rollback after the failed optimistic mutation uses the retained authoritative snapshot. Use fixture controls and condition-based waits. Do not activate checkout. Save screenshots/results and stop owned servers/tabs.

**Verify:** all command gates exit 0 and each named browser state is observed. Record exact commands, failure/recovery evidence, and any limits in `plans/011-cart-display-verification.md`. Missing browser evidence leaves the plan open.

## Done criteria

- [x] The old implementation fails the targeted behavior tests; the corrected implementation passes.
- [x] Failed results and thrown reads retain a populated cart; first-load error, retry, authoritative null, and successful empty states have coverage.
- [x] Both UI surfaces show retryable errors without false empty states or raw provider errors.
- [x] Real React/browser evidence covers rollback, retry, page/drawer/count synchronization, and confirmed empty recovery.
- [x] Full tests, lint, strict type/unused checks, build, and whitespace gates pass.
- [x] Scope review preserves all prior fixes and external state; plan status/index/evidence are updated.

## STOP conditions and maintenance

Stop and report if an upstream result cannot distinguish error from success, meaningful UI tests require a runner/dependency migration, preservation exposes a new ordering problem that needs mutation/checkout redesign, or a required edit falls outside the allowlist. After two failed verification attempts, reassess the cause and report any unresolved blocker instead of relaxing checks. Do not use arbitrary delays or a reducer tested in isolation as proof of actual provider behavior.

Keep failed reads distinct from authoritative emptiness in future cart changes. If another plan adds a real consumer of a currently unused UI primitive, plan 014 must retain it. No server recovery or purchase-policy change belongs here.

## Completion evidence

Completed 2026-10-16. Provider reads now retain the last successful snapshot on failure; the page/drawer show safe retryable errors and reserve empty states for successful reads. Added 21 regressions (7 provider, 14 display). All 216 tests, lint, strict type/unused checks, production build, and whitespace checks pass. A disposable original-source run confirmed 11 targeted behavior failures before the fix.

An enabled-shop production-mode fixture verified real optimistic rollback on the page and mobile drawer, retained items/count/totals after update-plus-refresh failure, failed and successful retries, first-load unavailable states, normal post-recovery updates, and confirmed absence clearing both views. Request counters proved no replacement or automatic mutation retry. The three edited components and the actual provider/mutation/action sources match the fixture unchanged; only its SDK boundary is synthetic. Temporary browser/server resources were cleaned up.

See [exact checks, screenshots, fixture evidence, and limits](011-cart-display-verification.md). This was self-review and local synthetic product verification, not an independent code review or live Shopify/checkout/deployment test. Existing unrelated work was preserved; no commit or external mutation occurred. Plan 012 is next.
