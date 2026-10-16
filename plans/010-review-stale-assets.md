# Plan 010: Remove stale public assets only after usage is resolved

> Executor instructions: Read this entire plan, follow the steps, and record evidence for each verification. This is a local implementation plan, not authorization to commit, push, open a PR, deploy, publish, delete external data, or change external configuration. Update this plan's row in `plans/README.md` when finished. Preserve unrelated edits.
>
> Drift check: Run `git status --short`, `git diff --stat 17af3a2..HEAD -- 'scripts/audit-public-assets.mjs' 'plans/010-asset-decisions.json' 'plans/010-asset-verification.md' 'public/aoty-cover-back.webp' 'public/aoty-mode-home.mp4' 'public/cart.svg' 'public/close.svg' 'public/esfera3D.gif' 'public/esfera3D.mp4' 'public/esfera3D.webm' 'public/file.svg' 'public/globe.svg' 'public/menu.svg' 'public/opac-world.mp4' 'public/social-instagram.svg' 'public/social-youtube.svg' 'public/sphere-lowheight.mp4' 'public/sphere-lowheight2.mp4' 'public/sphere-lowheight2_small.webm' 'public/temp_reverse_q80.webp' 'public/window.svg'`, and `git diff --stat -- 'scripts/audit-public-assets.mjs' 'plans/010-asset-decisions.json' 'plans/010-asset-verification.md' 'public/aoty-cover-back.webp' 'public/aoty-mode-home.mp4' 'public/cart.svg' 'public/close.svg' 'public/esfera3D.gif' 'public/esfera3D.mp4' 'public/esfera3D.webm' 'public/file.svg' 'public/globe.svg' 'public/menu.svg' 'public/opac-world.mp4' 'public/social-instagram.svg' 'public/social-youtube.svg' 'public/sphere-lowheight.mp4' 'public/sphere-lowheight2.mp4' 'public/sphere-lowheight2_small.webm' 'public/temp_reverse_q80.webp' 'public/window.svg'` before editing. Compare the excerpts below against the live files. Changes explicitly produced by the listed prerequisites are expected; verify their stated contracts and retain them. Stop on unexplained behavior drift, rather than restoring the old excerpts.

## Status

- **Audit finding**: Cleanup — stale assets
- **Priority**: P3
- **Effort**: M (S = hours; M = approximately a day, including verification)
- **Risk**: MED — public URLs may have CMS/external consumers
- **Depends on**: plan 002
- **Category**: tech-debt
- **Planned at**: commit `17af3a2`, 2026-10-15, Europe/Lisbon
- **Status**: DONE

## Why this matters

Eighteen public files totaling 15,901,818 bytes (about 15.2 MiB) have no source filename references. Removing confirmed obsolete files reduces checkout/deployment size, but source absence cannot establish that CMS content, shared links, or external embeds never use a URL. Make a per-file decision with reversible local changes and explicit external-usage evidence; do not promise page-speed savings from files never downloaded.

## Current state and conventions

Repository: `/Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb`. This is a private Next.js App Router application using TypeScript, React, pnpm, Sanity, and Shopify. Imports use `@/` for the repository root. There are no repository design/intent documents or additional checked-in agent instructions to override the supplied personal working agreements. Match existing local style; do not introduce a new application framework.

The candidate inventory and exact audit-time hashes are in `plans/010-asset-decisions.json`, created alongside this plan. Every candidate starts `pending`; no file is pre-approved for deletion. The scan excluded ignored `.DS_Store` files and searched application/component/hook/library/Sanity/script/test source, not CMS content or traffic.

Active alternatives are directly evidenced:
- `components/HeroSection.tsx:20` uses `/esfera3D_optimized.webm`.
- `components/Footer.tsx:17–18` uses `/opac-world.webm` and its poster.
- `components/AotyHero.tsx:85,107–108` uses `/aoty-cover-front.webp`, `/aoty-video.mp4?v=2`, and the current poster.
- `components/AotyCross.tsx:50–52` uses desktop/mobile poster assets; it also dynamically loads a live 3D component.
Preserve those files, `cross.glb`, all current posters, audio, gallery artwork, and every file outside the exact candidate allowlist. Similar names/extensions do not imply interchangeability or lack of browser fallback consumers.

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

- `scripts/audit-public-assets.mjs`
- `plans/010-asset-decisions.json`
- `plans/010-asset-verification.md`
- `public/aoty-cover-back.webp`
- `public/aoty-mode-home.mp4`
- `public/cart.svg`
- `public/close.svg`
- `public/esfera3D.gif`
- `public/esfera3D.mp4`
- `public/esfera3D.webm`
- `public/file.svg`
- `public/globe.svg`
- `public/menu.svg`
- `public/opac-world.mp4`
- `public/social-instagram.svg`
- `public/social-youtube.svg`
- `public/sphere-lowheight.mp4`
- `public/sphere-lowheight2.mp4`
- `public/sphere-lowheight2_small.webm`
- `public/temp_reverse_q80.webp`
- `public/window.svg`
- `plans/README.md`

This plan file may also receive status/completion-evidence updates only. Every other file is out of scope. Preserve prerequisite edits outside this allowlist; their existence does not authorize further edits to those files. Do not format unrelated files, upgrade unrelated dependencies, redesign UI, or change public behavior beyond the contract below.

## Git workflow

Remain in the current checkout unless the operator requests isolation. If a branch is explicitly requested later, use `codex/review-stale-assets`. Do not create commits, push, open a PR, or deploy as part of this plan. Existing history includes conventional messages such as `refactor: clean up website and improve mobile loading`, but message style does not authorize committing.

## Steps

### Step 1: Reproduce the local reference evidence

Create `scripts/audit-public-assets.mjs` as a read-only checker. Accept `--report`, `--check`, and `--check --after-removal`. `--check` validates complete decisions and verifies baseline hashes for files still present, including removal candidates before deletion. `--check --after-removal` additionally requires every remove-state file to be absent and every retain-state file to remain present and hash-matching. Load the explicit candidate inventory; compare tracked file size/hash against the audited baseline before considering removal. Search tracked source/config/metadata plus relevant new source files, excluding `.git`, dependencies, build output, ignored stores, and the plans' own inventory text. Check literal public URLs, URL query strings, CSS URLs, `srcSet`, and potential dynamic path construction. Report suspicious constructions for manual review rather than claiming a complete static proof. Do not add a package dependency or build-time broad asset purger.

**Verify:** `node scripts/audit-public-assets.mjs --report` exits 0, lists every candidate and classification, does not mutate any file, and initially reconciles 18 candidates totaling 15,901,818 bytes. Size/hash or reference drift is reported explicitly.

### Step 2: Resolve public-URL consumers per candidate

In `plans/010-asset-decisions.json`, record only URL/path, byte/hash baseline, state (`pending`, `retain`, `remove`), reason, and evidence summary. Check available authorized CMS references and aggregate request/embedding evidence without saving documents, customer data, signed URLs, or raw logs. If those sources are unavailable, retain the file or leave it pending; an owner may explicitly accept the unknown-consumer risk for an exact path. Source absence alone is insufficient. A `remove` state requires no current local references and either relevant external-use clearance or an explicit exact-path owner decision accepting that uncertainty. This plan authorizes local cleanup work when later executed, not production URL retirement/deployment.

**Verify:** `node scripts/audit-public-assets.mjs --check` fails for incomplete/unsupported removal decisions, detects new references/hash drift, and accepts explicit retain decisions without insisting every candidate be deleted.

### Step 3: Delete only the confirmed local candidates and verify

Before deleting, review the exact candidate paths with the decision inventory and Git status. Remove only files marked `remove` whose original tracked blobs remain recoverable in Git. Do not delete a directory, untracked owner asset, or sibling format by glob. Keep `retain` files unchanged and record pending entries as unresolved. Run the checker, build, and local browser smoke for home/A0TY/cross/footer, desktop/mobile, reduced motion, and unsupported-WebGL poster paths. Inspect asset requests for unexpected 404s. Do not modify active code to force a candidate unused or deploy the deletion.

**Verify:** `node scripts/audit-public-assets.mjs --check --after-removal` exits 0 and validates that remove files are absent/retained files unchanged; `pnpm build` and baseline checks pass. `git diff --name-status -- public` lists exactly the approved removal paths. Sum baseline `bytes` from remove-state inventory rows to record the saved bytes; binary numstat output is not a byte measurement. Record results in `plans/010-asset-verification.md`.

### Step 4: Record restore evidence and disposition

For each removed URL, record its original path, baseline commit/hash, and the local restore command `git restore --source=17af3a2 -- public/<exact-file>`. Review current work before restoring so unrelated modifications are not overwritten. If any decision remains pending, report partial completion and keep this plan open; if all are resolved, retained candidates are valid final outcomes.

**Verify:** the decision inventory contains no pending rows before DONE, and every removed file is present in the baseline Git tree via `git cat-file -e '17af3a2:public/<exact-file>'` (substitute one explicit approved path at a time).

## Test plan

This is asset inventory/removal, not application refactoring. Use the read-only checker to prove baseline hashes, current reference status, decision completeness, and removal scope. Add no snapshot tests for filenames. Build and direct browser/network evidence must preserve active video, image, audio, poster, and WebGL fallback behavior. No live CMS edits, production traffic probes, or production URL deletion is required or authorized.

## Done criteria

- [x] Every one of the 18 candidates has an evidence-backed `retain` or `remove` disposition; no pending decisions for DONE.
- [x] Removed files are exactly those marked `remove`, with recoverable baseline blobs and recorded byte savings.
- [x] No active format/poster/fallback/audio asset or out-of-scope path changed.
- [x] Read-only checker, build, and required browser/network checks pass; missing external evidence is not disguised as clearance.
- [x] No production deployment or public-URL retirement was performed.
- [x] Required lint, type, and test commands above pass; record commands actually run separately from checks not run.
- [x] Scope review confirms unrelated edits were preserved.
- [x] Update this plan's Status and the matching `plans/README.md` row; record any remaining verification limitations.

## STOP conditions

- Newly referenced, modified-hash, untracked, externally used, or uncertain assets must not be deleted on the strength of the original scan.
- If usage evidence is unavailable, retain or leave pending; do not invent an observation period or treat missing logs as zero traffic.
- Any production retirement, archival service, redirect rule, or changed code consumer requires a separate lifecycle/scope decision.
- Unexpected source drift, a required change outside the allowed files, or two failed verification attempts without a new explanation: stop and report the exact failure and remaining work.
- Do not bypass a failed gate with ignored diagnostics, disabled tests, arbitrary sleeps, invented external-usage evidence, or exposed credentials.

## Maintenance notes

A retained file can be correctly stale in local code yet intentionally public for a campaign or embed. Future asset audits must consider dynamic paths and external URLs. Keep the audit checker advisory/read-only; never attach automatic deletion to builds.

## Completion evidence

Completed on 2026-10-16, Europe/Lisbon. **18 retain, zero remove, zero pending; saved bytes 0.** No public asset changed. All 18 tracked files still match their recoverable baseline size/SHA-256, totaling 15,901,818 bytes. Retention is the final resolution because external public-URL consumers are unresolved; no deletion permission was inferred.

- Added a read-only checker with report/check/after-removal modes, baseline Git/current hash validation, literal URL/CSS/srcSet/query/encoded-reference detection, dynamic-path warnings, decision validation, and path-specific removal-evidence gates. It performs no writes, deletes, automatic builds, or network requests.
- Rechecked local references after all prerequisites: 149 text source/config files, zero literal references for the 18 candidates, nine dynamic constructions manually classified. A limited read-only aggregate CMS query found zero filename matches across 14 published records of the four current schemas. Draft/unknown-schema coverage and request/embed history were not cleared, so every candidate was retained with an evidence summary.
- Initial pending decisions correctly failed check mode. Final report/check/after-removal modes pass, and 13 isolated checker scenarios passed without changing real assets/inventory/Git metadata.
- All 190 repository tests, lint, strict non-emitting TypeScript/unused checks, production build, and diff whitespace checks pass. The public-file diff is empty.
- Actual production HTTP checks passed for all 44 public assets, six active media/model/audio range requests, and three public pages. Controlled desktop/mobile browser smoke covered home/A0TY/cross/footer, reduced-motion controls, and unsupported-WebGL poster preservation. Browser viewport/tab and owned servers were cleaned up.
- Existing mobile forced-WebGL-denial behavior leaves the activation button at `Cancel 3D` while the poster remains visible. It is separately recorded, not fixed or claimed as a successful unavailable-label transition. No asset-delivery failures or browser 404 entries were observed.
- Scope self-review confirms only the allowed audit script/inventory/verification files and plan status/evidence changed in this task. No dependency, application configuration, active rendering code, provider data/settings, commit, push, pull request, deployment, or URL retirement occurred.

See [per-file decisions, exact verification, and limitations](010-asset-verification.md). Every implementation plan in this series now has a recorded disposition; unresolved provider/external-usage and separately noted runtime limits remain explicit rather than treated as deployment verification.
