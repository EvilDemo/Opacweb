import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const manifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const config = await readFile(new URL("../bunfig.toml", import.meta.url), "utf8");

function run(directory, args) {
  const result = spawnSync("bun", args, {
    cwd: directory, encoding: "utf8", timeout: 30000,
    env: { PATH: process.env.PATH, NODE_ENV: "production" },
  });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  return result.stdout;
}

test("Bun runs only the preserved lifecycle allowlist, including on frozen clean installs", async () => {
  const directory = await mkdtemp(join(tmpdir(), "opac-install-policy-"));
  try {
    const names = ["@tailwindcss/oxide", "esbuild", "sharp", "unrs-resolver", "node-sass"];
    const dependencies = {};
    for (const [index, name] of names.entries()) {
      const folder = join(directory, `package-${index}`);
      await mkdir(folder);
      await writeFile(join(folder, "package.json"), JSON.stringify({ name, version: "1.0.0", scripts: { postinstall: "node install.cjs" } }));
      await writeFile(join(folder, "install.cjs"), `require('node:fs').appendFileSync(${JSON.stringify(join(directory, "ran.log"))}, ${JSON.stringify(name + "\n")});`);
      dependencies[name] = `file:./package-${index}`;
    }
    await writeFile(join(directory, "package.json"), JSON.stringify({ private: true, dependencies, trustedDependencies: manifest.trustedDependencies }));
    await writeFile(join(directory, "bunfig.toml"), config);
    const expected = ["@tailwindcss/oxide", "esbuild", "sharp"];
    for (const args of [["install"], ["install", "--frozen-lockfile"]]) {
      run(directory, args);
      const actual = (await readFile(join(directory, "ran.log"), "utf8")).trim().split("\n").sort();
      assert.ok(actual.includes("@tailwindcss/oxide"));
      assert.ok(actual.includes("esbuild"));
      for (const name of actual) assert.ok(expected.includes(name), `${name} must stay blocked`);
      await rm(join(directory, "ran.log"));
      await rm(join(directory, "node_modules"), { recursive: true });
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("Bun keeps Node as runtime and leaves mode-aware environment loading to Next", async () => {
  const directory = await mkdtemp(join(tmpdir(), "opac-runtime-policy-"));
  try {
    const nextRequire = createRequire(require.resolve("next"));
    const nextEnv = nextRequire.resolve("@next/env");
    await writeFile(join(directory, "bunfig.toml"), config);
    await writeFile(join(directory, ".env"), "OPAC_ENV_PROBE=base\n");
    await writeFile(join(directory, ".env.local"), "OPAC_ENV_PROBE=local\n");
    await writeFile(join(directory, ".env.production.local"), "OPAC_ENV_PROBE=production-local\n");
    await writeFile(join(directory, "package.json"), JSON.stringify({ private: true, scripts: { probe: "node probe.cjs" } }));
    await writeFile(join(directory, "probe.cjs"), `
const assert = require('node:assert/strict');
assert.equal(process.versions.bun, undefined);
assert.equal(process.env.OPAC_ENV_PROBE, undefined);
require(${JSON.stringify(nextEnv)}).loadEnvConfig(process.cwd(), false, {info(){},error(){}});
assert.equal(process.env.OPAC_ENV_PROBE, 'production-local');
console.log('Node runtime and Next environment precedence preserved');
`);
    assert.match(run(directory, ["run", "probe"]), /Node runtime and Next environment precedence preserved/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
