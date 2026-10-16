# Plan 013: Make the footer About link reach an existing page

> Executor instructions: Implement the smallest navigation correction, verify it, and update this Status and `plans/README.md`. Preserve existing work; no commit, push, PR, deployment, redirect service, or external change is authorized.
>
> Drift check first: `git status --short`; `git diff --stat 17af3a2..HEAD -- lib/constants.ts components/Footer.tsx components/Navbar.tsx`; and the same scoped `git diff --stat` without the range. Read the actual callers and current excerpts below. Existing audit and WebGL edits beyond HEAD are expected and must be preserved. Stop on unexplained requirements/behavior drift.

## Status

- **Finding**: Pre-existing footer About link targets nonexistent `/about`.
- **Priority**: P2
- **Effort**: S — one configuration change, navigation regression, browser check
- **Risk**: LOW
- **Confidence**: HIGH — built local app returned 404 for `/about` and 200 for `/about/us` and `/about/you`; footer HTML contains the broken link
- **Depends on**: completed navigation/crawler baseline from plans 007/009; execute after 011/012 as requested, with no code dependency on them
- **Category**: bug
- **Planned at**: commit `17af3a2` plus the existing audit working tree, 2026-10-16, Europe/Lisbon
- **Status**: DONE — verified 2026-10-16

## Why this matters

The sitemap already advertises valid About pages, but the footer still takes visitors to a 404. Give its existing About label a real default destination while preserving the desktop/mobile header's Us/You submenu and current layout.

## Current state and conventions

Repository: `/Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb`; private Next.js 16.3.8 / React 19.2.4 / TypeScript app with pnpm 12.11.2. `lib/constants.ts` owns shared navigation and shop visibility. At `26–43` it defines:

```ts
{
  label: "About",
  href: "/about",
  icon: "/menu-about.gif",
  requiresShop: false,
  subItems: [
    { label: "Us", href: "/about/us", /* existing metadata */ },
    { label: "You", href: "/about/you", /* existing metadata */ },
  ],
}
```

`getVisibleNavItems()` returns non-shop items. `components/Footer.tsx:39–46` renders each returned `item.href` directly. `Navbar.tsx` uses the subItems branch for About in both responsive menus; regular links use `item.href`. Both actual routes exist at `app/about/us/page.tsx` and `app/about/you/page.tsx`; no `app/about/page.tsx` exists.

Selected destination: `/about/us`, the existing first About child and introduction to the organisation. Keep the label `About`, all subItems/icons, filtering, and ordering. Fix the owning configuration rather than adding a footer-only URL override, a new page, or a redirect. Existing `tests/search-metadata.test.mjs` uses `node:test` and `tests/helpers/load-typescript.mjs`; match that dependency-free test style.

## Commands you will need

| Purpose | Command | Expected result |
|---|---|---|
| Focused navigation/metadata | `node --test tests/navigation.test.mjs tests/search-metadata.test.mjs` | All pass after correction |
| Full suite | `pnpm test` | All pass |
| Lint | `pnpm lint` | Exit 0, zero warnings |
| Types/unused | `pnpm exec tsc --noEmit --incremental false --noUnusedLocals --noUnusedParameters` | Exit 0 |
| Build | `pnpm build` | Exit 0 |
| Whitespace | `git diff --check` | Exit 0 |

## Scope and Git workflow

Only modify `lib/constants.ts`, `tests/navigation.test.mjs` (new), this plan's status/evidence, and `plans/README.md`. Read Footer/Navbar and route files as verification subjects, but do not change them. Do not alter layout, sitemap/robots, canonical host, shop flags, other links, public assets, dependencies, or add `/about` routing. Stay in the current checkout; if separately requested, branch name is `codex/fix-footer-about-link`. No commit is part of this plan.

## Steps

### Step 1: Capture the broken navigation contract

Add `tests/navigation.test.mjs`, loading the real constants module with explicit synthetic feature-flag environments. Assert that the visible About item's default destination equals its existing Us child route and that both Us/You destinations remain intact. Verify visible navigation excludes Shop in both shop modes while `getShopItem()` preserves its existing enabled/disabled contract. These are shared navigation behaviors, not tests for a literal source replacement.

Render the actual Footer with lightweight Link/Button/media/form dependencies if needed to assert its About anchor uses the shared destination. Avoid snapshotting the whole page or adding a testing dependency. The real running-page link check below must also run.

**Verify:** `node --test tests/navigation.test.mjs` fails because the About destination is `/about`, before changing production configuration.

### Step 2: Correct the authoritative default destination

Change only the About parent's href to `/about/us`. Do not change the label, Us/You child destinations, order, icon, or header submenu behavior. This leaves the Footer's existing rendering intact and removes the invalid navigation destination at its source.

**Verify:** the focused navigation/metadata command and all repository gates above pass. The old `/about` parent destination is gone from the current navigation result; the metadata tests still advertise both existing About pages.

### Step 3: Verify navigation in the built application

Start the production build on a free loopback port using `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port <free-port>`. Fetch home HTML, verify the Footer's About anchor points to `/about/us`, and request each unique same-origin footer destination; all must return 200 without a redirect. A read of `/about` may remain 404; creating that route is not required.

In a browser, activate Footer About at mobile and desktop widths and verify the Us page renders. Open the responsive header About menu at each width and verify Us and You still navigate to their respective pages. Restore viewport overrides and close owned tabs/servers. Do not submit forms.

**Verify:** record all footer URL/status assertions and the two responsive menu/navigation observations in this plan's completion evidence. Commands alone do not prove header interaction. No new redirect or page is present in the file diff.

## Done criteria

- [x] The behavior regression fails before and passes after the one navigation correction.
- [x] Footer About reaches `/about/us` with 200; all other footer links and both About submenu routes remain valid.
- [x] Desktop/mobile menu behavior is verified in the built application.
- [x] Full tests, lint, strict types/unused, build, and whitespace gates pass.
- [x] Only allowed files changed; evidence and plan/index status are updated.

## STOP conditions and maintenance

Stop if an authoritative product requirement now specifies another About landing page, either child route no longer exists, or the shared parent href controls a different behavior than the callers described above. Report a required out-of-scope change instead of inventing an About landing page or footer navigation system. Reassess repeated verification failures before another attempt.

Future grouped navigation items need valid default hrefs wherever a consumer renders the parent as an anchor. Child-route existence does not make a missing parent route valid. Crawler metadata and interactive navigation have separate contracts; retain both checks.

## Completion evidence — 2026-10-16

Changed only the shared About parent destination to `/about/us`; the existing Footer/Navbar, labels, icons, ordering, and Us/You submenu are unchanged. Six new navigation regressions load actual shared configuration in both shop modes and render the actual Footer with explicit lightweight dependencies. A disposable pre-fix copy of the final test harness produced four genuine link failures and two passes; final navigation/metadata checks pass 11/11. Initial test-harness JSX/default-import/VM-array issues were corrected separately, without weakening behavior assertions.

Both the pre-dependency and final full suites pass 297/297. Lint, strict non-emitting TypeScript/unused checks, production builds, and whitespace pass. Local production home HTML has the corrected footer href; every unique same-origin footer URL plus the You route returns 200 without redirects. Browser clicks verified Footer About at 390px and 1440px widths, desktop About expansion and Us/You navigation, and mobile menu Us/You navigation. Both pages rendered their existing content. The mobile menu closes and returns focus to its trigger. No form was sent.

Evidence is in `/private/tmp/opac-final-cleanup/navigation-{red-final,green}.log`, `footer-http.json`, and final `http-final.json`; shared runtime/dependency verification is recorded in [plan 015 validation](015-dependency-validation.md#final-verification). The normal build was regenerated after a fixture working-directory mistake; final runtime checks use the correct normal build. No new route, redirect, Footer/Navbar change, commit, or deployment occurred. This is self-verification, not an independent UI review.
