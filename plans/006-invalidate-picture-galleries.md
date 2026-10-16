# Plan 006: Invalidate gallery data with its picture document

> Executor instructions: Read this entire plan, follow the steps, and record evidence for each verification. This is a local implementation plan, not authorization to commit, push, open a PR, deploy, publish, delete external data, or change external configuration. Update this plan's row in `plans/README.md` when finished. Preserve unrelated edits.
>
> Drift check: Run `git status --short`, `git diff --stat 17af3a2..HEAD -- 'lib/mediaData.ts' 'tests/media-cache.test.mjs' 'tests/sanity-webhook.test.mjs' 'plans/006-gallery-runtime-verification.md'`, and `git diff --stat -- 'lib/mediaData.ts' 'tests/media-cache.test.mjs' 'tests/sanity-webhook.test.mjs' 'plans/006-gallery-runtime-verification.md'` before editing. Compare the excerpts below against the live files. Changes explicitly produced by the listed prerequisites are expected; verify their stated contracts and retain them. Stop on unexplained behavior drift, rather than restoring the old excerpts.

## Status

- **Audit finding**: 5 — gallery cache tags do not match webhook tags
- **Priority**: P1
- **Effort**: S (S = hours; M = approximately a day, including verification)
- **Risk**: LOW — slightly broader invalidation of picture-related data
- **Depends on**: plan 001, plan 002, plan 003, plan 004
- **Category**: bug
- **Planned at**: commit `17af3a2`, 2026-10-15, Europe/Lisbon
- **Status**: DONE

## Why this matters

The picture listing and per-picture gallery are fetched separately. Only the listing carries the `pictures` tag that the webhook invalidates, so gallery image changes can remain stale for an hour. Attach the picture-document tag to gallery fetches so the existing authenticated invalidation covers every view of that document.

## Current state and conventions

Repository: `/Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb`. This is a private Next.js App Router application using TypeScript, React, pnpm, Sanity, and Shopify. Imports use `@/` for the repository root. There are no repository design/intent documents or additional checked-in agent instructions to override the supplied personal working agreements. Match existing local style; do not introduce a new application framework.

`lib/mediaData.ts:61–64` tags listing fetches with `pictures`. At `:149–152`, gallery fetches use:
```ts
next: {
  revalidate: process.env.NODE_ENV === "development" ? 0 : 3600,
  tags: ["gallery", `gallery-${id}`],
},
```
`app/api/sanity-webhook/route.ts:58–62` maps `pictures` to `pictures`, and its `_id`-only delete branch also invalidates `pictures`. `app/media/pictures/[id]/page.tsx` reads listing metadata and gallery separately. Preserve React `cache()` request memoization, production 3600-second TTL, existing result types, and current error fallbacks. Prerequisites add raw-body authentication and supported immediate expiry; retain them.

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

- `lib/mediaData.ts`
- `tests/media-cache.test.mjs`
- `tests/sanity-webhook.test.mjs`
- `plans/006-gallery-runtime-verification.md`
- `plans/README.md`

This plan file may also receive status/completion-evidence updates only. Every other file is out of scope. Preserve prerequisite edits outside this allowlist; their existence does not authorize further edits to those files. Do not format unrelated files, upgrade unrelated dependencies, redesign UI, or change public behavior beyond the contract below.

## Git workflow

Remain in the current checkout unless the operator requests isolation. If a branch is explicitly requested later, use `codex/invalidate-picture-galleries`. Do not create commits, push, open a PR, or deploy as part of this plan. Existing history includes conventional messages such as `refactor: clean up website and improve mobile loading`, but message style does not authorize committing.

## Steps

### Step 1: Test the document freshness contract

Create `tests/media-cache.test.mjs` using the plan 001 loader. Call real exported `getPictures()` and `getGallery(id)` with a fake configured environment and a recording `sanityClient.fetch`; use distinct synthetic picture IDs. Capture each fetch's tags and TTL. Extend signed webhook cases to record the invalidated tags. Assert that a picture-document event invalidates a tag common to both its listing and its gallery. Avoid testing only a hardcoded implementation string.

**Verify:** `node --test tests/media-cache.test.mjs tests/sanity-webhook.test.mjs` exposes the current disjoint gallery tags while preserving the other webhook expectations.

### Step 2: Add the shared tag to gallery fetches

Change the gallery tags to `["pictures", "gallery", \`gallery-${id}\`]`. Keep existing gallery-specific tags to avoid removing an established invalidation capability. No webhook schema changes or new tag utility are needed. This intentionally invalidates all picture galleries on a pictures event; it is a small, correct coarse boundary. Leave non-picture media untouched.

**Verify:** focused tests pass for picture update and supported delete payloads. Tests show music/video/radio events do not use the `pictures` tag. Run all baseline gates.

### Step 3: Verify actual cache refresh locally

In a local production server with an isolated synthetic Sanity-response fixture, warm one gallery read, change the fixture result, send a correctly signed local picture webhook, and read again. Await the first request completing, the webhook completing, and the subsequent response; no arbitrary sleeps. A controlled data-provider fixture or explicitly authorized test dataset is required; do not edit production content. Record the verification mechanism and observed before/after synthetic values in `plans/006-gallery-runtime-verification.md`.

**Verify:** `pnpm build` passes, the gallery reflects the changed fixture on the post-invalidation read, and runtime reports no invalid-profile error. If only mock-based tests are available, keep this runtime gate outstanding.

## Test plan

Cover common listing/gallery invalidation, two picture IDs, a signed picture update, supported `_id`-only deletion, non-picture events, denied requests with zero invalidation, unchanged gallery-specific tags, and unchanged production TTL. Existing error/null behavior remains characterized rather than refactored.

## Done criteria

- [x] Both listing and gallery fetches carry the picture-document invalidation tag.
- [x] Authenticated picture updates/deletes invalidate the gallery through the actual route contract.
- [x] Other media types, response types, fetch TTLs, and React memoization are unchanged.
- [x] Actual local cache-refresh evidence is recorded, or the plan remains incomplete with that gate identified.
- [x] Required lint, type, and test commands above pass; record commands actually run separately from checks not run.
- [x] Scope review confirms unrelated edits were preserved.
- [x] Update this plan's Status and the matching `plans/README.md` row; record any remaining verification limitations.

## STOP conditions

- If the provider's real delete projection differs from the currently supported `_id`-only shape, preserve current behavior and report the configuration question; do not infer a new payload.
- If freshness still fails because the Sanity CDN serves stale upstream data, stop and isolate that separate layer rather than disabling all caching or changing live-content architecture.
- Unexpected source drift, a required change outside the allowed files, or two failed verification attempts without a new explanation: stop and report the exact failure and remaining work.
- Do not bypass a failed gate with ignored diagnostics, disabled tests, arbitrary sleeps, invented external-usage evidence, or exposed credentials.

## Maintenance notes

A future targeted per-document tag strategy may reduce invalidation work, but requires listing/deletion semantics and provider projections to be designed together. Coarse picture invalidation is intentional in this plan, not a performance bug to optimize away.

## Completion evidence

Completed on 2026-10-16, Europe/Lisbon. The only production change adds `pictures` to the existing gallery tags. TTLs, React request memoization, error/result behavior, non-picture reads, and the authenticated webhook remain unchanged.

- Added 15 behavioral tests in `tests/media-cache.test.mjs`. Signed update/delete cases call the real webhook and public verifier, then compare invalidated tags with the actual options recorded from listing and two gallery reads. Existing Sanity webhook tests were reused unchanged. Before the fix, those two shared-tag cases failed and 57 focused cases passed; afterward all 59 passed.
- All 160 repository tests, lint, strict non-emitting TypeScript/unused checks, production build, and diff whitespace checks passed.
- An isolated Next production fixture with byte-identical media data layer and webhook files passed 30 reads and four webhook requests. Changed synthetic data remained cached before invalidation; the first read after a signed picture update returned the new listing and both gallery revisions. A signed ID-only deletion removed the deleted gallery, and repeat reads hit cache. Rejected and non-picture events did not invalidate picture data. Runtime logs contained no revalidation errors; both servers were stopped.
- Self-review confirmed the one-line production diff and scope. Prior cart, webhook, dependency, and plan/test work was preserved. No dependencies, external systems, provider content, or lifecycle state were changed by this plan.
- Real Sanity CDN propagation, deployed configuration/provider delivery, and browser rendering/navigation were not verified. The isolated provider boundary is documented rather than presented as production delivery evidence.

See [runtime verification](006-gallery-runtime-verification.md) for commands, observed synthetic before/after values, and limitations. Plan 007 is next in order.
