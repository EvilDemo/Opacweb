# Plan 007: Align crawler metadata with current canonical routes

> Executor instructions: Read this entire plan, follow the steps, and record evidence for each verification. This is a local implementation plan, not authorization to commit, push, open a PR, deploy, publish, delete external data, or change external configuration. Update this plan's row in `plans/README.md` when finished. Preserve unrelated edits.
>
> Drift check: Run `git status --short`, `git diff --stat 17af3a2..HEAD -- 'app/sitemap.ts' 'app/robots.txt' 'tests/search-metadata.test.mjs'`, and `git diff --stat -- 'app/sitemap.ts' 'app/robots.txt' 'tests/search-metadata.test.mjs'` before editing. Compare the excerpts below against the live files. Changes explicitly produced by the listed prerequisites are expected; verify their stated contracts and retain them. Stop on unexplained behavior drift, rather than restoring the old excerpts.

## Status

- **Audit finding**: 7 — stale sitemap host and nonexistent about route
- **Priority**: P2
- **Effort**: S (S = hours; M = approximately a day, including verification)
- **Risk**: LOW — crawler metadata correction
- **Depends on**: plan 001
- **Category**: bug
- **Planned at**: commit `17af3a2`, 2026-10-15, Europe/Lisbon
- **Status**: DONE

## Why this matters

The sitemap and robots file advertise a different host from the site's canonical metadata, and the sitemap includes a nonexistent `/about` page. Make these crawler entry points consistent with the existing canonical host and known public routes, without changing page copy, canonical policy elsewhere, or deployment redirects.

## Current state and conventions

Repository: `/Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb`. This is a private Next.js App Router application using TypeScript, React, pnpm, Sanity, and Shopify. Imports use `@/` for the repository root. There are no repository design/intent documents or additional checked-in agent instructions to override the supplied personal working agreements. Match existing local style; do not introduce a new application framework.

`app/layout.tsx:48` uses `metadataBase: new URL("https://opacweb.pt")`; individual public pages also use that host. `app/sitemap.ts:4,15` instead uses:
```ts
const baseUrl = "https://weareopac.com";
url: `${baseUrl}/about`,
```
`app/robots.txt:26` advertises `https://weareopac.com/sitemap.xml`. Current static public routes are `/`, `/about/us`, `/about/you`, `/media`, `/radio`, `/contact`, `/a0ty`, `/cross`, `/privacy-policy`, and `/terms-of-service`. `/shop` is feature-gated; `/cart` and `/checkout` explicitly request no indexing. There is no `app/about/page.tsx`. Keep existing crawler disallows and allowance rules; their redesign was not part of this finding.

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

- `app/sitemap.ts`
- `app/robots.txt`
- `tests/search-metadata.test.mjs`
- `plans/README.md`

This plan file may also receive status/completion-evidence updates only. Every other file is out of scope. Preserve prerequisite edits outside this allowlist; their existence does not authorize further edits to those files. Do not format unrelated files, upgrade unrelated dependencies, redesign UI, or change public behavior beyond the contract below.

## Git workflow

Remain in the current checkout unless the operator requests isolation. If a branch is explicitly requested later, use `codex/align-search-metadata`. Do not create commits, push, open a PR, or deploy as part of this plan. Existing history includes conventional messages such as `refactor: clean up website and improve mobile loading`, but message style does not authorize committing.

## Steps

### Step 1: Lock the supported route list and canonical choice

Use `https://opacweb.pt`, matching the accepted page metadata, as the scoped correction. Confirm the static paths above exist by enumerating `app/**/page.tsx`. If deployment/accepted product evidence contradicts that host, stop for the authoritative choice; do not change dozens of canonical URLs on inference. Keep feature-gated shop routes and all dynamic product/gallery URLs out of this small static sitemap change.

**Verify:** `rg --files app -g page.tsx` contains the declared static routes and no `/about` page; existing canonical evidence still agrees with `opacweb.pt`.

### Step 2: Correct sitemap and robots output

Change the sitemap host, replace `/about` with `/about/us` and `/about/you`, and include the remaining listed always-public static routes. Match existing typed `MetadataRoute.Sitemap` output. Remove fabricated `lastModified: new Date()` for entries without genuine content-modification evidence rather than claiming every build edits every page. Retain sensible existing changeFrequency/priority values where applicable; do not fetch all CMS/Shopify data or add dynamic sitemap infrastructure. Change only the Sitemap URL line in robots.

**Verify:** `node --test tests/search-metadata.test.mjs` passes after Step 3.

### Step 3: Add output-level verification

Create `tests/search-metadata.test.mjs`. Load and call the actual sitemap function; parse each URL and assert host, unique paths, explicit static route coverage, no nonexistent `/about`, and no Studio/API/cart/checkout paths. Read robots as its public text artifact and assert its advertised sitemap agrees. Assert entries do not advertise an invented current timestamp. Build/run locally and fetch `/sitemap.xml` and `/robots.txt` to check status and rendered output.

**Verify:** focused tests, all baseline gates, and `pnpm build` pass. Requests to the two local crawler endpoints return 200 with the intended host and path set.

## Test plan

Use the node:test pattern from `tests/cart-state.test.mjs` and the TypeScript loader added by plan 001. Test returned sitemap values and robots public content, not exact source syntax. No live search-engine submission, indexing requests, or production crawling is part of this plan.

## Done criteria

- [x] Both crawler endpoints advertise `https://opacweb.pt` consistently with current canonical metadata.
- [x] Sitemap entries cover the specified existing static public pages, with no duplicates, nonexistent `/about`, or private/noindex routes.
- [x] Unknown modification timestamps are omitted.
- [x] Local built endpoint responses are verified; no deployment settings changed.
- [x] Required lint, type, and test commands above pass; record commands actually run separately from checks not run.
- [x] Scope review confirms unrelated edits were preserved.
- [x] Update this plan's Status and the matching `plans/README.md` row; record any remaining verification limitations.

## STOP conditions

- If authoritative hosting/domain evidence contradicts the existing canonical host, stop with the concrete conflict and request the domain decision.
- If new routes are gated, private, or redirected, do not include them automatically.
- Dynamic CMS/product sitemap generation is outside this plan.
- Unexpected source drift, a required change outside the allowed files, or two failed verification attempts without a new explanation: stop and report the exact failure and remaining work.
- Do not bypass a failed gate with ignored diagnostics, disabled tests, arbitrary sleeps, invented external-usage evidence, or exposed credentials.

## Maintenance notes

When adding an always-public static route, update the sitemap's explicit route coverage test. Dynamic discovery, cross-domain redirects, robots policy changes, and richer SEO work remain separate follow-ups.

## Completion evidence

Completed on 2026-10-16, Europe/Lisbon, in the existing checkout.

### Implementation and scope

- Enumerated `app/**/page.tsx` and checked existing layout/page canonical metadata. The ten approved static public routes exist, `/about` has no page, and current canonical evidence consistently uses `https://opacweb.pt`.
- Updated the sitemap to that host, replaced `/about` with `/about/us` and `/about/you`, and included `/radio`, `/a0ty`, `/cross`, `/privacy-policy`, and `/terms-of-service`. Existing applicable frequency/priority values were retained; no gated shop, dynamic product/gallery, API, Studio, cart, or checkout entries were added.
- Removed build-time modification dates because no genuine page-modification evidence is available. Sitemap typing remains `MetadataRoute.Sitemap`, with a type-only import.
- Changed only the robots Sitemap URL line; all existing crawl allowances/disallows and comments remain intact.
- Added five output-level regression tests invoking the actual sitemap and reading the actual public robots text. They cover canonical origin, unique exact path coverage, excluded routes, omitted unsupported modification dates, and matching sitemap advertisement.
- Self-reviewed the scoped diff. Earlier cart, gallery, webhook, dependency, and plan/test edits were preserved. No other page metadata, dependencies, provider settings, redirects, or deployment configuration changed. No independent review was required for this narrow metadata correction.

### Verification

| Command | Outcome |
|---|---|
| `node --test tests/search-metadata.test.mjs` before the correction | All five regression cases failed for the expected stale host, wrong/missing routes, and unsupported modification dates |
| Same focused command after the correction | 5/5 passed |
| `pnpm test` | 165/165 passed |
| `pnpm lint` | Passed with zero warnings |
| `pnpm exec tsc --noEmit --incremental false --noUnusedLocals --noUnusedParameters` | Passed; includes the basic type-check gate |
| `pnpm build` | Passed |
| `node /private/tmp/opac-plan-007-runtime.mjs` | Both actual production crawler endpoints and all ten advertised pages passed local HTTP checks |
| `git diff --check` | Passed |

The runtime runner launched the installed Next production server directly through Node on loopback port 4217, awaited its readiness message, consumed every response, and stopped its own server afterward. It used no arbitrary sleeps or external crawler requests.

- `/sitemap.xml` returned 200 with an XML content type and sitemap namespace, exactly ten unique intended URLs on `https://opacweb.pt`, and no `lastmod` values or stale host.
- `/robots.txt` returned 200 as plain text, exactly matching the corrected public file and advertising `https://opacweb.pt/sitemap.xml` once.
- All ten advertised paths returned 200 without redirects when fetched locally. This verifies the actual built route output, not only source-level path existence.
- The completed run reported no server errors. The server was stopped after verification.

Session artifacts are `/private/tmp/opac-plan-007-runtime.mjs`, `/private/tmp/opac-plan-007-runtime-evidence.json`, and `/private/tmp/opac-plan-007-*.log`.

**Limits:** No production deployment, domain/redirect changes, external production crawl, indexing submission, or search-engine indexing behavior was verified or performed. Browser rendering was not exercised for this text/XML metadata correction. Dynamic sitemap discovery remains intentionally unsupported by this static change. Plan 008 is next in order.
