# Plan 011 verification: cart display survives failed reads

Completed 2026-10-16, Europe/Lisbon, in the existing checkout based on `17af3a2` plus earlier uncommitted audit work. Only the three allowed commerce components, two new test files, and plan/index/evidence files changed for this implementation. Prior audit/WebGL changes were preserved. No dependency, environment, provider, cookie-policy, checkout, public-asset, commit, push, PR, or deployment change was made.

## Implemented behavior

- `CartContext.refreshCart` keeps its last successful snapshot on an action error or rejected read. Only an error-free response replaces the snapshot; explicit successful null still clears it. Existing loading/error cleanup and mutation serialization remain intact.
- The cart page and drawer consume the existing `error` and `refreshCart` context fields. A safe inline alert and Retry button accompany retained items/totals, while first-load errors show an unavailable state without claiming the cart is empty. Neither view displays raw SDK error details.
- Retry invokes the existing read operation and is disabled during loading. Successful retry clears the warning. Error-free null and zero-line snapshots retain the genuine empty state. Existing mutation/checkout availability rules and the separate data/UI/count hooks were preserved.

## Regression and repository checks

| Check actually run | Outcome |
|---|---|
| `node --test tests/cart-context.test.mjs tests/cart-display.test.mjs` against the pre-fix working tree | Genuine cart retention/error-display assertions failed; an initial test-tree traversal bug was separately corrected |
| The final same two test files against a disposable copy of the three original `17af3a2` components | 11 expected behavior failures, 10 passes, no loader/traversal errors; confirmed the red baseline without restoring or overwriting repository source |
| `node --test tests/cart-context.test.mjs tests/cart-display.test.mjs` against the implementation | 21/21 passed after final test cleanup |
| `pnpm test` | 216/216 passed, including the original 195 tests and all existing cart recovery/query/action/REST/locking cases |
| `pnpm lint` | Passed with zero warnings after correcting two unused names in the test Button adapter |
| `pnpm exec tsc --noEmit --incremental false --noUnusedLocals --noUnusedParameters` | Passed, no diagnostics |
| `pnpm build` | Passed under Next.js 16.3.8; compilation, TypeScript, and 21 generated static pages completed |
| `git diff --check` | Passed |

The seven provider tests use the real provider with a controlled action, deferred promises, and a small hook harness. They cover returned/rejected failures, first-load errors, repeated explicit failures, retry with changed quantities, successful null, successful empty cart, loading cleanup, and one read per explicit attempt. They assert public context results rather than state-slot numbers or setter calls.

The fourteen display tests load the actual page/drawer and real Price formatter with controlled context and lightweight UI adapters. They cover safe messages, retained line quantities/totals, retry invoking only a read, error-before-empty precedence, genuine empty states, loading/disabled retry, warning-free recovery, and existing pending/checkout rules. These tests do not model portal visibility, effect scheduling, or `useOptimistic` rollback; browser verification below supplies that evidence.

Temporary logs: `/private/tmp/opac-plan-011-tests-red-confirmed.log`, `opac-plan-011-tests-focused-final.log`, `opac-plan-011-tests-final.log`, `opac-plan-011-lint-final.log`, `opac-plan-011-types.log`, and `opac-plan-011-build.log`. Each abbreviated name is under `/private/tmp/`.

## Production-mode browser fixture

Prepared `/private/tmp/opac-plan-011-fixture` with copied current application components, hooks, cart page, styles, provider/action/query/recovery code, and the installed dependencies. Only its Shopify client boundary was replaced with an in-memory synthetic SDK responder. Fixture-only scenario controls select provider read failure, a held failing update, normal behavior, or confirmed absence. Those routes/controls do not exist in the application repository.

The fixture uses a minimal layout with actual Navbar, CartProviderBoundary, and Toaster, plus its controls. It is an enabled-shop test environment with synthetic process-only Shopify values and dummy Sanity configuration; no environment file or real provider credential was changed. It does not include the full application's route loader/analytics. Final hash comparison confirmed the three edited components, mutation hook, Navbar, actions, cart query/mutations, recovery operation, cookie constants, and cart-state helper match the repository byte-for-byte.

Commands used from the fixture directory, with synthetic values in the child process environment:

```sh
node /Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb/node_modules/next/dist/bin/next build --webpack
node /Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb/node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 4222
```

The first fixture build identified missing copied `sanity/lib/image` helpers because all current components were included in typechecking. Copying the current Sanity directory into the disposable fixture resolved that harness omission; the second fixture build passed. No real source or dependency was changed to bypass the check. No install/pnpm script was run against a symlinked dependency directory.

Browsed `http://localhost:4222/cart` in the in-app browser, first at its default desktop viewport and then 390×844:

1. Loaded two synthetic lines through the actual actions: shirt quantity 1, record quantity 2, navigation count 3, subtotal/total €60.00.
2. On the page, held an actual quantity update at an explicit fixture promise latch. Observed optimistic shirt quantity 2, navigation count 4, and disabled pending controls. The synthetic upstream still had quantities `[1, 2]`.
3. Released the latch through the fixture control endpoint. The update failed and its subsequent refresh failed. Observed actual React rollback to quantities 1/2 and count 3; both lines, €60.00 totals, and an inline warning/Retry remained visible.
4. Retried once while reads still failed: the snapshot survived. Restored the synthetic provider and used the actual page Retry: warning disappeared and the original cart remained.
5. On mobile, repeated the held optimistic update in the actual drawer. Observed its pending quantity/disabled controls, then rollback to 1/2 with both lines, €60.00 subtotal, and visible Retry. Closed the drawer and confirmed the page shared the same retained error/cart state.
6. Restored the provider, reopened the drawer, and used its actual Retry. The warning cleared and both lines remained; closing the drawer preserved the page/count state.
7. Failed another refresh and reloaded the browser while the synthetic cart cookie still existed. With no client snapshot, the page and drawer showed `We couldn't load your cart. Please try again.` and Retry; neither claimed emptiness. Restoring the provider and using Retry recovered the same two lines/count 3, confirming the failed read had not discarded the cart cookie.
8. Performed a normal successful quantity update after recovery: count 4 and €80.00 totals. Then returned error-free explicit null from the synthetic provider: both page and drawer reached the genuine empty state with no Retry/error, exercising the existing cookie deletion path.

No arbitrary sleeps determined correctness. Promise latches, specific rendered states, and response/count assertions governed progress. A broad initial `role=alert` disappearance check matched an unrelated empty notification live region; verification was narrowed to the cart warning text and Retry control, which correctly disappeared on recovery. This was a selector issue, not a product failure.

Final fixture counters: **10 reads, 1 initial create, 1 initial add, 3 quantity updates (2 intentionally failed, 1 successful), 0 removals**. Between failed-update/refresh/retry stages, counters confirmed one read per explicit refresh and no replacement cart or automatic mutation retry. Detailed counter snapshots are in `/private/tmp/opac-plan-011-browser-counts.json`.

Saved screenshots:

- `/private/tmp/opac-plan-011-page-failure.jpg` — desktop retained cart and warning.
- `/private/tmp/opac-plan-011-mobile-drawer-failure.jpg` — mobile retained quantities, subtotal, and Retry.
- `/private/tmp/opac-plan-011-first-load-failure.jpg` — unavailable state instead of false emptiness.

The browser reported only the existing Radix missing drawer-description warning previously recorded in plan 009. No new browser error was observed. Expected synthetic provider failures were logged by the unchanged server handlers. The viewport override was reset, the temporary browser tab closed, and the owned fixture server stopped.

## Scope and remaining limits

This implementation was self-reviewed against plan 011 and verified in an isolated production-mode browser fixture; no new independent code review was claimed. The earlier cold planning review remains planning evidence only. No mutation hook, action/API/provider contract, cookie lifetime, checkout rule, UI primitive, dependency, active asset, or public endpoint changed. Existing unrelated working-tree edits remain intact.

Live Shopify behavior, customer-cart mutations, checkout/order placement, production deployment, and authenticated provider/Studio configuration were not tested. The pre-existing drawer-description warning remains separate scope. Plans 012–015 are not implemented by this task.
