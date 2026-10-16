# Plan 009: Remove confirmed unused exports and duplicate configuration

> Executor instructions: Read this entire plan, follow the steps, and record evidence for each verification. This is a local implementation plan, not authorization to commit, push, open a PR, deploy, publish, delete external data, or change external configuration. Update this plan's row in `plans/README.md` when finished. Preserve unrelated edits.
>
> Drift check: Run `git status --short`, `git diff --stat 17af3a2..HEAD -- 'lib/shopify/actions.ts' 'components/commerce/CartContext.tsx' 'lib/shopify/types.ts' 'types/commerce.ts' 'lib/constants.ts'`, and `git diff --stat -- 'lib/shopify/actions.ts' 'components/commerce/CartContext.tsx' 'lib/shopify/types.ts' 'types/commerce.ts' 'lib/constants.ts'` before editing. Compare the excerpts below against the live files. Changes explicitly produced by the listed prerequisites are expected; verify their stated contracts and retain them. Stop on unexplained behavior drift, rather than restoring the old excerpts.

## Status

- **Audit finding**: Cleanup — unused exports
- **Priority**: P3
- **Effort**: S (S = hours; M = approximately a day, including verification)
- **Risk**: LOW — narrow deletions; no runtime feature removal
- **Depends on**: plan 001, plan 005, plan 008
- **Category**: tech-debt
- **Planned at**: commit `17af3a2`, 2026-10-15, Europe/Lisbon
- **Status**: DONE

## Why this matters

A few leftover commerce exports and an unread configuration block imply capabilities that no current caller uses. Remove only confirmed leftovers after the behavior fixes so the cleanup cannot erase types or operations those fixes legitimately need. Type-only deletion improves clarity, not browser performance.

## Current state and conventions

Repository: `/Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb`. This is a private Next.js App Router application using TypeScript, React, pnpm, Sanity, and Shopify. Imports use `@/` for the repository root. There are no repository design/intent documents or additional checked-in agent instructions to override the supplied personal working agreements. Match existing local style; do not introduce a new application framework.

Confirmed at audit baseline:
- `lib/shopify/actions.ts:165`: exported `clearCartAction`, zero callers.
- `components/commerce/CartContext.tsx:120`: combined `useCart()` calls `useCartData()`/`useCartUI()` and returns both; zero callers. The private `CartContextType` at line 25 exists only for that wrapper.
- `lib/shopify/types.ts:6,12,17,30`: `Money`, `Connection<T>`, `Edge<T>`, and `UserError` have no consuming application code. `Edge` is used only inside unused `Connection`. `PageInfo` is genuinely used by products and must remain.
- `types/commerce.ts:102`: unused `ShopifyError` interface.
- `lib/constants.ts:54–58`: unread `SHOP_CONFIG.SHOPIFY`; active Shopify configuration lives in `lib/shopify/constants.ts`.

Preserve `CartProvider`, `useCartData`, `useCartUI`, `useCartItemCount`, `SHOP_CONFIG.ENABLED`, navigation data/helpers, core commerce types and the active Shopify module. `lib/shopify/index.ts` re-exports types: a re-export is not by itself an actual consumer. No entire component/library file was proven unreachable.

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

- `lib/shopify/actions.ts`
- `components/commerce/CartContext.tsx`
- `lib/shopify/types.ts`
- `types/commerce.ts`
- `lib/constants.ts`
- `plans/README.md`

This plan file may also receive status/completion-evidence updates only. Every other file is out of scope. Preserve prerequisite edits outside this allowlist; their existence does not authorize further edits to those files. Do not format unrelated files, upgrade unrelated dependencies, redesign UI, or change public behavior beyond the contract below.

## Git workflow

Remain in the current checkout unless the operator requests isolation. If a branch is explicitly requested later, use `codex/remove-unused-exports`. Do not create commits, push, open a PR, or deploy as part of this plan. Existing history includes conventional messages such as `refactor: clean up website and improve mobile loading`, but message style does not authorize committing.

## Steps

### Step 1: Recompute consumers after prerequisites

Search symbol uses across `app`, `components`, `hooks`, `lib`, `types`, `sanity`, `scripts`, and `tests`, including type imports and barrel imports. Read each hit and trace to an actual caller, not just declarations/re-exports. Plan 008 may add shared cookie policy, and earlier fixes may introduce a real need for a listed type; retain any such symbol and record why. Do not add dummy callers to make cleanup tests pass.

**Verify:** `rg -n '\b(clearCartAction|useCart|Money|Connection|Edge|UserError|ShopifyError)\b|SHOP_CONFIG\.SHOPIFY' app components hooks lib types sanity scripts tests` has been classified into real consumers versus definitions/re-exports before deletion.

### Step 2: Remove only zero-consumer declarations

Delete `clearCartAction`, the unused combined `useCart` wrapper and its now-unused private type, unused listed type definitions, and unread `SHOP_CONFIG.SHOPIFY`. Do not remove core imports still used by other functions, change existing public hooks, sweep all shadcn exports, or delete source modules. Leave type re-exports unrelated to the explicitly unused definitions alone. Keep prerequisites' new shared cart operations and cookie options.

**Verify:** `pnpm exec tsc --noEmit --incremental false --noUnusedLocals --noUnusedParameters` and `pnpm lint` pass. Repeat the consumer search; removed declarations have no residual production references. Retained new consumers are documented.

### Step 3: Check observable behavior

Run all tests and a production build. Inspect local navigation and cart page/drawer/add controls with the shop enabled in an authorized local test configuration; verify existing distinct cart hooks still work. Record exact removals/retentions in this plan's completion note; do not invent bundle-size savings for type declarations.

**Verify:** `pnpm test` and `pnpm build` exit 0. Local product smoke has no missing-export/runtime errors.

## Test plan

No new tests that assert declaration absence or mirror export wiring. Existing boundary/cart tests, strict unused-local checks, full typecheck, build, and focused product smoke are appropriate for this reversible cleanup. If an existing test imports an allegedly unused export to prove meaningful behavior, that is a real consumer to retain or review.

## Done criteria

- [x] Every removed symbol has a documented zero-consumer search after prerequisite changes.
- [x] No active component, hook, shared policy, `PageInfo`, core commerce type, or dependency was removed.
- [x] Removed and retained-with-reason candidates are listed in a completion note.
- [x] Strict unused-local/parameter typecheck and production build pass.
- [x] Required lint, type, and test commands above pass; record commands actually run separately from checks not run.
- [x] Scope review confirms unrelated edits were preserved.
- [x] Update this plan's Status and the matching `plans/README.md` row; record any remaining verification limitations.

## STOP conditions

- If any candidate gains a legitimate caller, retain it and record the evidence; do not force the original removal list.
- If an external published API or generated integration consumes these exports, stop before removing that contract.
- If cleanup requires modifying a file outside the allowlist, stop and report rather than expanding into a barrel refactor.
- Unexpected source drift, a required change outside the allowed files, or two failed verification attempts without a new explanation: stop and report the exact failure and remaining work.
- Do not bypass a failed gate with ignored diagnostics, disabled tests, arbitrary sleeps, invented external-usage evidence, or exposed credentials.

## Maintenance notes

This private web app has no published package export contract in package.json, but dynamically loaded and framework-rooted files are still used. Unused exported types need consumer analysis beyond TypeScript's noUnusedLocals flag. No new dead-code package is needed for this small deletion set.

## Completion evidence

Completed on 2026-10-16, Europe/Lisbon. Removed seven unused exports, one now-unneeded private interface, and one duplicate configuration property. No source module, component file, dependency, REST endpoint, or public asset was removed.

### Consumer evidence and exact removals

Before deletion, searched all prescribed source/script/test roots using:

```sh
rg -n '\b(clearCartAction|useCart|Money|Connection|Edge|UserError|ShopifyError)\b|SHOP_CONFIG\.SHOPIFY' app components hooks lib types sanity scripts tests
rg -n 'import\s+\*|export\s+\*|require\(|import\(' app components hooks lib types sanity scripts tests --glob '*.ts' --glob '*.tsx' --glob '*.mjs' --glob '*.js'
rg -n '\bSHOP_CONFIG\b|\bCartContextType\b|\bPageInfo\b' app components hooks lib types sanity scripts tests
```

Read and classified each hit, including barrel/type imports and dynamically loaded modules. No namespace/dynamic import accesses these candidates. `package.json` marks this application private and declares no published export/entrypoint contract.

| Removed candidate | Evidence after plans 005/008 |
|---|---|
| `clearCartAction` in `lib/shopify/actions.ts` | Only its declaration and its own error-log message; no action import/caller, including meaningful tests |
| Combined `useCart` in `CartContext.tsx` | Only its declaration; consumers use the distinct data/UI/count hooks |
| Private `CartContextType` | Only its declaration and the removed combined wrapper's return annotation |
| `Money` in `lib/shopify/types.ts` | Only its declaration/comment; no consuming type import or application use |
| `Connection<T>` | Only its own declaration; no consuming application code |
| `Edge<T>` | Used only inside the unused `Connection`; no reachable consumer |
| `UserError` | Only its declaration; the provider module's separate internal mutation error type remains in use and was not changed |
| `ShopifyError` in `types/commerce.ts` | Only its declaration; query validation uses the installed SDK response contract |
| `SHOP_CONFIG.SHOPIFY` | No property, destructuring, spread, or alias consumer; configuration-object callers use `ENABLED` or navigation data/helpers. Active Shopify configuration remains in `lib/shopify/constants.ts` |

The Shopify barrel's existing `export * from "./types"` is not itself a consuming application. It was left intact alongside unrelated type re-exports; no barrel refactor was needed. The broad symbol search after deletion found only an English `Connection failed` script message and browser `Edge` CSS comments, with no remaining references to removed production symbols.

All planned candidates remained unused. Retained `PageInfo` because `lib/shopify/products.ts` imports and uses it for product pagination; retained core product/cart types and their existing re-exports. Retained `CartProvider`, `useCartData` (page, drawer, add button), `useCartUI` (drawer), `useCartItemCount` (navigation), shop flag/navigation helpers, active Shopify configuration, plan 005 recovery, and plan 008 cookie policy. No broad UI export sweep or new dummy consumer/test was added.

### Repository checks

| Command | Outcome |
|---|---|
| `pnpm test` | 190/190 passed; no new absence/wiring tests added |
| `pnpm lint` | Passed, zero warnings |
| `pnpm exec tsc --noEmit --incremental false --noUnusedLocals --noUnusedParameters` | Passed; includes the basic non-emitting type gate |
| `pnpm build` | Passed |
| Repeated consumer search | No removed-symbol production references; only unrelated English/CSS matches described above |
| `git diff --check` | Passed after removing the blank line left at EOF by the deleted final interface |

Self-review confirmed only the five allowed source files and plan status/evidence changed for this task. All prerequisite/unrelated edits were preserved. Type-only removal is a clarity improvement; no browser bundle-size or performance savings were measured or claimed.

### Enabled-shop browser smoke

Built a temporary Next.js 16.3.8 production fixture in `/private/tmp/opac-plan-009-fixture`, copying the current navigation, commerce components/hooks, data types, shared constants, actions, recovery/provider implementations, and styles. Only the fixture's Shopify client was replaced with an in-memory synthetic SDK responder. Its shop page hosts the actual add button; its cart page is copied from the application. `NEXT_PUBLIC_SHOP_ENABLED=true` and synthetic Shopify values were set only for the fixture's build/runtime processes; no repository environment file, real customer cart, or provider settings changed.

Session setup used `node /private/tmp/opac-plan-009-runtime.mjs prepare` followed by copying the current component/helper/style sources into the fixture. Its production build used the installed Next CLI directly with `build --webpack`, with shop enabled; no dependency installation occurred. The normal application was separately verified with its unchanged `pnpm build`.

Launched the fixture directly through installed Next's `start --hostname 127.0.0.1 --port 4219` with the synthetic process environment, and tested `http://localhost:4219/shop` in the in-app browser:

1. Enabled navigation, shop link, cart trigger, and active add control rendered.
2. Adding a synthetic shirt invoked the real server action and automatically opened the drawer with quantity 1, exercising the retained data and UI hooks.
3. Increasing quantity in the drawer showed 2; closing it restored the navigation's `Open cart with 2 items` count, exercising the retained count hook.
4. Client navigation to the actual cart page showed the same line and quantity 2 with working controls.
5. Removing the final line showed `Your cart is empty` and returned the navigation cart trigger to an empty count.
6. The retained shop navigation link returned to the enabled add-control page.

No missing-export, context, or runtime error appeared. One existing Radix drawer warning about missing accessibility description was observed and left outside this cleanup; no accessibility redesign was performed. The synthetic responder does not calculate prices, so pricing/totals were not a smoke-test assertion. No checkout button was activated and no order/provider mutation occurred.

Saved browser proof at `/private/tmp/opac-plan-009-cart-smoke.jpg`. Session build/check logs are `/private/tmp/opac-plan-009-*.log`. The temporary browser tab was closed and its owned server stopped after verification.

**Limits:** This was self-review plus synthetic local browser verification, not independent review, live Shopify mutation testing, external integration enumeration, production deployment, or performance measurement. No commit, push, or pull request was made. Plan 010's separate public-asset evidence gates remain untouched; no asset deletion is included here.
