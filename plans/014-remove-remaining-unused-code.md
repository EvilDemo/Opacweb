# Plan 014: Remove confirmed unused helpers and UI declarations

> Executor instructions: Recompute consumers after the behavior fixes, remove only confirmed unused candidates, run the gates, and update this Status and `plans/README.md`. This is local cleanup, not authorization to commit, push, open a PR, deploy, or delete public assets or external data.
>
> Drift check first: `git status --short`; `git diff --stat 17af3a2..HEAD -- sanity/lib/image.ts lib/sanity.ts components/MediaCard.tsx components/ui/card.tsx components/ui/form.tsx components/ui/navigation-menu.tsx components/ui/sheet.tsx components/ui/badge.tsx components/ui/button.tsx`; and the same scoped `git diff --stat` without the range. Read the live declarations and actual consumers. Plans 001–013 and the WebGL correction may legitimately add consumers or preserve edits beyond HEAD. A newly used candidate must be retained, not made unused to satisfy this plan.

## Status

- **Finding**: Small unused declarations and unnecessarily exported module internals remain after the narrow commerce cleanup.
- **Priority**: P3
- **Effort**: S — bounded consumer analysis and deletions; no feature refactor
- **Risk**: LOW, subject to rechecking dynamic/type consumers
- **Confidence**: HIGH for current zero-consumer candidates; recheck after 011–013
- **Depends on**: completed plan 009; execute after 011, 012, and 013 so their legitimate new consumers survive
- **Category**: tech-debt
- **Planned at**: commit `17af3a2` plus the existing audit working tree, 2026-10-16, Europe/Lisbon
- **Status**: DONE — verified 2026-10-16

## Why this matters

The private application retains one unused Sanity wrapper and six unused UI component declarations. Several other symbols are used within their own module but need not be exported. Delete dead implementations and narrow only the named module interfaces; do not equate an unused export with an unused implementation or invent bundle-size savings for type-only changes.

## Current state and conventions

Repository: `/Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb`. Next.js 16.3.8 / React 19.2.4 / TypeScript, pnpm 12.11.2; private package with no published package export contract. Existing tests use `node:test` and a TypeScript loader. This plan extends the explicit narrow cleanup scope of plan 009; it does not reopen completed commerce deletions or authorize an arbitrary shadcn regeneration/sweep.

The final review traced framework roots, configuration entries, static/type/barrel imports, and lazy imports and found no wholly unreachable source module. In particular, `NewsletterForm` is dynamically imported by `LazyNewsletterForm` and Three components are lazily loaded; retain them. A raw unused-export report can miss these uses.

### Candidates and selected dispositions

| File / current location | Candidate | Disposition if still unused |
|---|---|---|
| `sanity/lib/image.ts:8–10` | `export const urlFor = (source) => builder.image(source)` | Delete the wrapper and its export; retain builder and `SanityImageSource` used by active helpers |
| `components/ui/card.tsx:144,179,194` | `CardAction`, `CardFooter` | Delete both component declarations and exports |
| `components/ui/form.tsx:125,164` | `FormDescription` | Delete declaration and export; preserve active form control/message behavior |
| `components/ui/navigation-menu.tsx:123,148` | `NavigationMenuIndicator` | Delete declaration and export |
| `components/ui/sheet.tsx:91,105,115` | `SheetFooter`, `SheetDescription` | Delete declarations/exports only if no predecessor/UI consumer now needs them |
| `sanity/lib/image.ts:12` | `getOptimizedImageUrl` | Keep implementation and internal calls; remove only `export` |
| `lib/sanity.ts:3` | `config` | Keep configuration and `createClient(config)`; remove only `export` |
| `components/MediaCard.tsx:177` | `PictureItem`, `VideoItem`, `MusicItem` | Keep the three interfaces in `MediaItem`; remove only their exports; retain exported `MediaItem` |
| `components/ui/badge.tsx:46` / `button.tsx:93` | `badgeVariants`, `buttonVariants` | Keep variants and all internal typing/calls; remove only exports |
| `components/ui/form.tsx:159` | `useFormField` | Keep hook used by active form components; remove only export |
| `components/ui/navigation-menu.tsx:149–150` | `NavigationMenuViewport`, `navigationMenuTriggerStyle` | Keep internal rendering/styles; remove only exports |

The stale note at `lib/sanity.ts:19` currently says `Use imagePresets ... instead of this urlFor function`, although `imagePresets` does not exist and current consumers use `getResponsiveImageProps`. Remove or correct this adjacent misleading note as part of the named helper cleanup; do not rewrite other comments/docs.

## Commands you will need

| Purpose | Command | Expected result |
|---|---|---|
| Candidate search | `rg -n '\b(urlFor|getOptimizedImageUrl|PictureItem|VideoItem|MusicItem|CardAction|CardFooter|FormDescription|NavigationMenuIndicator|SheetFooter|SheetDescription|badgeVariants|buttonVariants|useFormField|NavigationMenuViewport|navigationMenuTriggerStyle)\b' app components hooks lib types sanity scripts tests` | Every hit classified before deletion |
| Indirect imports | `rg -n 'import\s+\*|export\s+\*|require\(|import\(' app components hooks lib types sanity scripts tests` | Dynamic/namespace/barrel consumers inspected |
| Types/unused | `pnpm exec tsc --noEmit --incremental false --noUnusedLocals --noUnusedParameters` | Exit 0 |
| Lint | `pnpm lint` | Exit 0, zero warnings |
| Tests | `pnpm test` | All pass, including 011–013 regressions |
| Build | `pnpm build` | Exit 0 |
| Asset guard | `node scripts/audit-public-assets.mjs --check --after-removal` | Exit 0; all 18 retained assets unchanged |
| Whitespace | `git diff --check` | Exit 0 |

## Scope and Git workflow

Only modify the nine source files named in the candidate table: `sanity/lib/image.ts`, `lib/sanity.ts`, `components/MediaCard.tsx`, and `components/ui/{card,form,navigation-menu,sheet,badge,button}.tsx`. This plan and `plans/README.md` may receive status/evidence updates. No other source or test file is in scope.

Do not delete source modules, dependencies, public assets, REST endpoints, core commerce types, `PageInfo`, shared cart policy, form accessibility wiring, or active helpers. Preserve standard UI behavior/styles/prop contracts. Do not remove the locally used bodies of candidates whose exports alone are unused. No new tests asserting that an identifier is absent or duplicating export wiring. Stay in the current checkout; a separately requested branch would be `codex/remaining-unused-code`. No commit or release is part of this work.

## Steps

### Step 1: Recompute and classify actual consumers

Run both searches above and a targeted `rg -n '\bconfig\b|@/lib/sanity|lib/sanity' app components hooks lib types sanity scripts tests`. Inspect hits including type-only references, imports/re-exports, namespace members, dynamic access, and meaningful tests. A declaration/re-export alone is not a consuming call. Conversely, internal uses mean a body must survive even when its export is unnecessary.

For each named candidate record remove-body, unexport-only, or retain-with-evidence in this plan's completion note. Newly needed `SheetDescription` or `FormDescription` is a real consumer, even if introduced by a behavior/accessibility fix. Do not add dummy consumers or remove real tests to force deletion. Do not extend the candidate list opportunistically.

**Verify:** the searches have a complete per-candidate disposition with evidence. Every remove-body candidate has zero real consumers; every unexport-only candidate retains its local callers.

### Step 2: Make only the classified deletions/interface reductions

Apply the table's selected dispositions where still justified. Remove imports made unused exclusively by those deletions. Preserve the existing type union, image output, form error/description-ID contracts, navigation viewport/styles, and active cart hooks. Correct only the adjacent stale helper note identified above. Do not delete CSS variants simply because an optional component was removed.

**Verify:** strict unused/type and lint commands exit 0; repeat the candidate/import searches and confirm no surviving consumer references a removed symbol. Newly retained candidates remain documented. Diff review shows no changed active rendering, behavior, public endpoint, or dependency specification.

### Step 3: Verify the product and record exact scope

Run the full suite, production build, asset guard, and whitespace gate. Smoke the built home/footer/navigation, media/radio cards and responsive images, contact form rendering, and enabled-shop cart drawer/page with synthetic local provider data. Verify desktop/mobile header open/close/focus behavior and the existing form submission/error path without transmitting a real form or purchasing anything. Inspect current consumers rather than creating a showcase for deleted components.

Use temporary fixtures only if shop/provider configuration is unavailable. Run installed Next directly against copied current files; never install packages against a symlinked dependency directory. Keep new fixture code outside the repository. Record observed interactions and known pre-existing warnings separately; do not claim a deployment, independent product test, or measured bundle saving.

**Verify:** all command gates exit 0, smoke evidence has no missing exports/runtime errors or new form/navigation regressions, and the public-file diff is empty. Record exact removals, narrowed exports, retentions, and limitations before setting DONE.

## Done criteria

- [x] Every named candidate has a current consumer classification; newly used candidates are retained.
- [x] Only dead implementations are deleted; locally used implementations/types remain with narrowed exports where applicable.
- [x] All strict type/unused, lint, test, build, asset, whitespace, and scoped product checks pass.
- [x] No dependency, source module, active behavior, endpoint, or public asset was removed.
- [x] Scope/evidence/status/index are updated; no absence-only tests or unsupported performance claims were added.

## STOP conditions and maintenance

Stop if a candidate has an unresolved dynamic/external consumer, another module relies on the export as a published integration, or cleanup needs an out-of-scope active-code refactor. Retaining an uncertain/newly used candidate is a valid disposition, not a reason to force its removal. Reassess repeated check failures and report unresolved blockers rather than suppressing diagnostics.

TypeScript's unused-local check alone cannot prove exports are unused. Keep consumer analysis in future cleanups; do not introduce automatic deletion. The 18 public-asset candidates remain retained under plan 010 and are not reopened here.

## Completion evidence — 2026-10-16

Recomputed named, type, namespace, barrel, and lazy consumers after plans 011–013. Every candidate matched the planned disposition; no uncertain/new consumer was deleted. Removed exactly seven unused bodies and narrowed ten further named exports across the nine allowed files:

| File | Removed implementation | Kept internally, removed export only | Consumer evidence |
|---|---|---|---|
| sanity/lib/image.ts | urlFor | getOptimizedImageUrl | Wrapper had no callers; active responsive presets retain optimized-image calls and SanityImageSource |
| lib/sanity.ts | None | config | createClient(config) remains; removed only the adjacent stale imagePresets/urlFor note |
| components/MediaCard.tsx | None | PictureItem, VideoItem, MusicItem | All three remain in exported MediaItem union |
| components/ui/card.tsx | CardAction, CardFooter | None | Only declarations/export-list references existed |
| components/ui/form.tsx | FormDescription | useFormField | No description consumer; hook remains used by label/control/message, with existing IDs/error wiring intact |
| components/ui/navigation-menu.tsx | NavigationMenuIndicator | NavigationMenuViewport, navigationMenuTriggerStyle | Indicator had no consumer; NavigationMenu still renders the viewport and trigger still uses the style |
| components/ui/sheet.tsx | SheetFooter, SheetDescription | None | No consumers; active titles/content/overlay/close/focus behavior remain |
| components/ui/badge.tsx | None | badgeVariants | Badge's render/type uses retained |
| components/ui/button.tsx | None | buttonVariants | Button's render/type uses retained |

The dynamic NewsletterForm and Three imports, all source modules, dependencies, public assets, commerce helpers, and active types remain. No absence-only tests or bundle-size claims were added. Read the installed project code and shadcn component documentation; no component regeneration or styling rewrite occurred.

Before dependency changes, all 297 tests, lint, strict type/unused checks, production build, asset guard, and whitespace passed. The same final checks pass after plan 015. The asset guard confirms all 18 retained candidates unchanged (15,901,818 bytes), and the public-file diff is empty.

Browser checks exercised actual home/footer/header, media/radio cards and loaded responsive images, contact form validation without sending data, desktop/mobile menus, and the enabled-shop cart page/drawer through a synthetic SDK fixture. Blank form submission showed field messages; closing returned focus to Submit Work. Mobile navigation and cart drawer closing returned focus to their triggers. Cart add/update/remove, retained items/count/totals after failed refresh, repeated retry, recovery, and desktop drawer all worked. Existing missing drawer-description warnings remain; removing an unused wrapper neither introduced nor resolves that pre-existing warning. See [shared final runtime record](015-dependency-validation.md#final-verification).

Self-review checked each file diff and retained internal uses; independent review covered dependency compatibility only. No active source behavior, endpoint, source module, or asset was removed. No commit/deployment occurred.
