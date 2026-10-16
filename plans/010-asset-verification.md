# Public asset review

Reviewed on 2026-10-16, Europe/Lisbon. **18 retained, zero removed, zero pending.** The candidates total 15,901,818 bytes (about 15.2 MiB). Saved bytes: **0**. No public URL, active rendering code, dependency, environment file, or provider setting changed.

The candidates have no current local literal references and no filename matches in the limited published-CMS check. Neither observation clears external requests, shared links, embeds, drafts, or unknown schemas. Request/embedding history was unavailable and there was no exact-path owner acceptance of that uncertainty. Retaining all existing URLs is the selected final disposition, not proof that they are in active use.

## Per-file disposition

All files are tracked, present, and size/SHA-256 identical to their recoverable `17af3a2` blobs. Exact hashes and evidence summaries remain in [the decision inventory](010-asset-decisions.json).

| Path | Baseline bytes | Decision |
|---|---:|---|
| `public/aoty-cover-back.webp` | 6,104,296 | Retain: external artwork/share use unresolved |
| `public/aoty-mode-home.mp4` | 213,918 | Retain: external video/fallback use unresolved |
| `public/cart.svg` | 418 | Retain: public icon URL use unresolved |
| `public/close.svg` | 392 | Retain: public icon URL use unresolved |
| `public/esfera3D.gif` | 3,297,658 | Retain: external animation use unresolved |
| `public/esfera3D.mp4` | 1,219,401 | Retain: external video/fallback use unresolved |
| `public/esfera3D.webm` | 1,274,751 | Retain: external video use unresolved |
| `public/file.svg` | 391 | Retain: public icon URL use unresolved |
| `public/globe.svg` | 1,035 | Retain: public icon URL use unresolved |
| `public/menu.svg` | 295 | Retain: public icon URL use unresolved |
| `public/opac-world.mp4` | 1,384,225 | Retain: external video/fallback use unresolved |
| `public/social-instagram.svg` | 768 | Retain: public icon/embed use unresolved |
| `public/social-youtube.svg` | 488 | Retain: public icon/embed use unresolved |
| `public/sphere-lowheight.mp4` | 445,795 | Retain: external video/fallback use unresolved |
| `public/sphere-lowheight2.mp4` | 424,879 | Retain: external video/fallback use unresolved |
| `public/sphere-lowheight2_small.webm` | 71,815 | Retain: external video use unresolved |
| `public/temp_reverse_q80.webp` | 1,460,908 | Retain: external artwork/share use unresolved |
| `public/window.svg` | 385 | Retain: public icon URL use unresolved |

No restore commands were needed because nothing was removed. The checker reads every original Git blob and verifies its size/hash; it never updates Git or writes/deletes assets. No deletion, staging, commit, push, pull request, deployment, redirect, or production URL retirement was performed.

## Local reference evidence

`scripts/audit-public-assets.mjs` scans tracked plus nonignored new source/config/metadata files. It excludes dependencies, Git/build/tool stores, environment files, the plans' own inventory/evidence, its own fixed candidate list, and the dependency lockfile. The final report examined 149 text source/config files from 206 tracked/nonignored paths. All 18 candidates had zero literal-reference locations. It handles filename boundaries, query strings, percent-encoded filenames, CSS URLs, and srcSet delimiters. It reports file/line locations without printing source bodies or configuration values.

Nine possible dynamic constructions were reported and manually reviewed:

- Four test locations construct synthetic HTTP endpoint URLs or expected shop paths.
- Shopify webhook product-path invalidation, MediaCard gallery links, and ProductCard links construct application routes.
- AotyHero constructs `/${song.src}` from the five declared `aoty-songs/song-*.webp` entries, which are active and outside this candidate list.
- The Sanity responsive-image builder produces provider URLs/srcSet values, not these public candidate paths.

These classifications do not make the scanner a complete static proof. Runtime strings, new source formats, encoded/indirect references, provider content, external URLs, and traffic still need human review. Similar filenames/extensions are not treated as interchangeable or as evidence of safe deletion.

## CMS and external evidence

An authorized read-only query used the application's configured public Sanity project/dataset in memory, with CDN caching disabled and no credentials or document contents printed/saved. It checked the **14 published records** of the four checked-in media schema types: pictures, video, music, and radio. Only title/description/link fields and dereferenced current thumbnail/gallery asset URLs were projected for an in-memory filename comparison. Every candidate had zero matches. Only aggregate counts were saved in `/private/tmp/opac-plan-010-cms-summary.json`.

Drafts, unknown schemas, historical content, external embeds/shared links, and production request logs were not cleared. No authorized aggregate request/embedding source was available in this task, and none was fabricated or inferred from zero local imports. This limited CMS check is not removal clearance.

The session helper initially tried to load `@next/env` from the application root; pnpm exposes it under Next's dependency boundary. The helper was corrected to resolve the installed environment loader through Next, without installing anything or changing the repository.

## Checker behavior and verification

Supported commands:

```sh
node scripts/audit-public-assets.mjs --report
node scripts/audit-public-assets.mjs --check
node scripts/audit-public-assets.mjs --check --after-removal
```

`--report` is advisory and lists every candidate, hashes/presence issues, references, dynamic locations, states, and removal bytes. `--check` additionally rejects pending/incomplete decisions, baseline/current hash drift, and unsupported removals. `--after-removal` requires remove-state paths to be absent and retain-state paths to remain unchanged. Retain decisions are valid even when external evidence is unavailable.

Remove-state rows require no current literal references and path-specific local/dynamic review plus either an external-clearance attestation or exact-path owner acceptance of unknown consumers. The required evidence string formats are defined in the script. These are human-reviewed evidence records, not automatic proof of their truth or permission for a lifecycle action. The checker performs no removal and is not attached to builds.

Verification results:

| Check | Outcome |
|---|---|
| Initial `--report` | Reconciled 18 candidates and 15,901,818 bytes; every baseline/current hash matched |
| Initial `--check` with pending rows | Failed as required |
| Final `--report`, `--check`, and `--check --after-removal` | Passed; 18 retain, zero remove/pending, zero removal bytes |
| Isolated checker scenarios | 13/13 passed: report/check/after modes, pending decision, unsupported removal, synthetic path-specific acceptance, still-present removal, query/CSS/srcSet/encoded references, synthetic absence, working hash drift, altered inventory hash, missing retained file, invalid flags |
| `pnpm test` | 190/190 passed |
| `pnpm lint` | Passed, zero warnings |
| `pnpm exec tsc --noEmit --incremental false --noUnusedLocals --noUnusedParameters` | Passed; includes basic non-emitting type checking |
| `pnpm build` | Passed |
| `git diff --check` | Passed |
| `git diff --name-status -- public` | Empty: no asset changed or was removed |

The checker tests copied only test files and assets into a private temporary fixture with read-only access to existing Git metadata. Synthetic removal/approval records and moved/drifted copies never affected the real inventory, public assets, or Git state. One initial harness assertion counted four matches placed on one line as four reference locations; the scanner correctly reports locations. The fixture was corrected to use four separate lines, after which all 13 scenarios passed. No snapshot/absence tests or new package dependencies were added.

## Running product and asset delivery

The actual application production build ran on loopback port 4221 using `/private/tmp/opac-plan-010-http.mjs`:

- All **44 tracked public assets** returned 200 to HEAD, with Content-Length matching current file size.
- Six active media/model/audio URLs returned 206 and the requested 32 bytes: optimized sphere WebM, footer WebM, A0TY MP4 with query string, cross model, and both active audio files.
- Home, A0TY, and cross pages returned 200. No asset 404 or server error occurred. The runner stopped its server after verification.

A separate production fixture at `/private/tmp/opac-plan-010-browser` copied the current rendering components, page implementations, helpers, styles, and all public assets. It used a synthetic/disabled provider configuration and a fixture-only layout; actual analytics/customer data were not needed. A pre-hydration fixture script can simulate reduced-motion media queries or deny WebGL contexts solely inside this temporary app. These are controlled branch tests, not changes to OS/browser preferences or repository code.

The fixture was built with the installed Next CLI's `build --webpack`, then started directly on loopback port 4220. Its first build lacked a synthetic dataset variable required by the copied Sanity image module; providing `NEXT_PUBLIC_SANITY_DATASET=production` resolved that fixture setup failure. No dependency installation occurred.

In-app browser observations:

- Desktop home used `esfera3D_optimized.webm` and `sphere-poster.webp`; bringing the footer into view attached `opac-world.webm` with its poster.
- Desktop/mobile A0TY retained cover art, the current promotional MP4/query string/poster, song artwork, cross posters, and the active audio source. At 390×844 the cross initially remained a poster with opt-in 3D; desktop rendering reached its live state without deleting its poster resources.
- Cross at mobile and desktop sizes attached its canvas and current audio/model path. No browser 404 entries were captured.
- Controlled reduced-motion home/A0TY enabled manual video controls and preserved visible cross posters instead of automatic desktop live activation.
- Controlled unsupported-WebGL desktop/mobile retained the poster at full opacity and preserved the responsive desktop and mobile poster sources. Expected WebGL-creation errors were logged by that intentionally denied context.

**Separate existing behavior:** After mobile activation under forced WebGL denial, the poster stayed visible but the button remained `Cancel 3D` instead of reaching its intended unavailable label. An initial label wait timed out; inspection confirmed the actual retained-poster behavior. This is not an asset-reference or delivery failure, and no fallback/component code was changed. It is recorded as a follow-up rather than claimed fixed. Audio fidelity, every codec/browser combination, external embed availability, and detailed animation performance were not certified by this smoke test.

Browser proof is saved at `/private/tmp/opac-plan-010-poster-smoke.jpg` and `/private/tmp/opac-plan-010-mobile-poster-smoke.jpg`. The viewport override was reset, the temporary tab closed, and both owned servers stopped. Session scripts, aggregate JSON summaries, and logs are under `/private/tmp/opac-plan-010-*`.

## Final scope and limitations

Only the read-only audit script, decision inventory, this verification record, and plan status/evidence changed. Prior implementation work and every public file were preserved. This review was self-verified; no destructive cleanup required independent approval/review because no deletion was selected or performed.

All candidate dispositions are complete as retain. Future cleanup requires new exact-path evidence or explicit owner risk acceptance; it must rerun hash/reference checks before any separately authorized removal or deployment. No checkout/deployment-size reduction or page-speed gain is claimed from this review.
