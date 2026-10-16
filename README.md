# OPAC website

Use **Bun 1.4.3** as the package manager and **Node.js 24** as the application runtime.

```sh
bun install --frozen-lockfile
bun run dev
bun run lint
bun run typecheck
bun run test
bun run build
bun run start
```

Use `bun run test` and `bun run build` to invoke the project scripts. Tests use Node's test runner; Next, ESLint and TypeScript also run with Node. `bunfig.toml` preserves isolated dependencies and lets Next handle application environment files.

Commit `bun.lock`, `package.json`, `bunfig.toml`, and both files in `patches/` together. Only `@tailwindcss/oxide`, `esbuild`, and `sharp` may run dependency lifecycle scripts; `unrs-resolver` and Bun's other default trusted packages remain excluded. Do not use `bun pm trust --all`.

Three scoped overrides and two local patches address the remaining dependency findings. `bun audit` still reports the patched braces and sprintf-js versions because no fixed releases exist; those reports are not suppressed. The installed-source regressions run with the normal test suite. See [security verification](plans/016-security-and-drawer-verification.md) and [Bun migration verification](plans/017-bun-migration-verification.md).

Bun 1.4.3's installer still loads `.env` files despite its opt-out flags ([upstream issue](https://github.com/oven-sh/bun/issues/31450)). The explicit lifecycle allowlist remains in force. Application scripts disable Bun's environment preloading so Next retains its mode-aware precedence; do not rely on the install-time opt-out to isolate environment values from trusted install scripts.

## Vercel

`vercel.json` selects `bunx bun@1.4.3 install --frozen-lockfile` and `bun run build`. `engines.node` selects Node 24; Bun is not enabled as a Functions runtime. Vercel supports [Bun package management](https://vercel.com/docs/package-managers), [pinning Bun](https://vercel.com/kb/guide/how-to-pin-a-specific-bun-version-for-vercel-builds), and [Node 24](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

Keep the Next.js framework preset, normal environment variables, and Node runtime. Remove obsolete pnpm install/build overrides from any external CI configuration. Repository Vercel configuration is prepared, but remote project settings and a deployment have not been inspected or changed.
