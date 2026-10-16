import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { test } from "node:test";

// Resolve through the actual consumers so hoisting cannot hide an unpatched copy.
const require = createRequire(import.meta.url);
const sanityRequire = createRequire(require.resolve("sanity"));
const cliRequire = createRequire(sanityRequire.resolve("@sanity/cli"));
const runtimeEntry = cliRequire.resolve("@sanity/runtime-cli");
const runtimeRequire = createRequire(runtimeEntry);
const frameworksEntry = cliRequire.resolve("@vercel/frameworks");
const frameworksRequire = createRequire(frameworksEntry);
const codegenRequire = createRequire(sanityRequire.resolve("@sanity/codegen"));
const chokidarRequire = createRequire(codegenRequire.resolve("chokidar"));
const globbyRequire = createRequire(codegenRequire.resolve("globby"));
const fastGlobRequire = createRequire(globbyRequire.resolve("fast-glob"));
const micromatch = fastGlobRequire("micromatch");
const micromatchRequire = createRequire(fastGlobRequire.resolve("micromatch"));
const braces = chokidarRequire("braces");
const yaml = frameworksRequire("js-yaml");
const argparseRequire = createRequire(frameworksRequire.resolve("js-yaml"));
const argparse = argparseRequire("argparse");
const sprintfRequire = createRequire(argparseRequire.resolve("argparse"));
const { sprintf } = sprintfRequire("sprintf-js");

test("both codegen pattern consumers enforce the patch", () => {
  for (const read of [braces.compile, braces.expand, braces.stringify, micromatchRequire("braces").compile]) {
    assert.throws(() => read("{".repeat(160) + "a,b" + "}".repeat(160)), {
      name: "SyntaxError", message: "Brace nesting exceeds maximum depth of 128",
    });
  }
});

test("braces bounds parentheses as well as curly nesting before recursive work", () => {
  for (const symbol of ["(", "{"]) {
    const close = symbol === "(" ? ")" : "}";
    assert.throws(() => braces.parse(symbol.repeat(128) + "x" + close.repeat(128)), /maximum depth of 128/);
    assert.doesNotThrow(() => braces.compile(symbol.repeat(120) + "x" + close.repeat(120)));
  }
});

for (const method of ["compile", "expand", "stringify"]) {
  test(`braces ${method} bounds caller-provided ASTs`, () => {
    let ast = { type: "text", value: "x" };
    for (let i = 0; i < 160; i++) ast = { type: "root", nodes: [ast] };
    assert.throws(() => braces[method](ast), { name: "SyntaxError", message: "Brace nesting exceeds maximum depth of 128" });
    const cyclic = { type: "root", nodes: [] };
    cyclic.nodes.push(cyclic);
    assert.throws(() => braces[method](cyclic), /maximum depth of 128/);
  });
}

test("ordinary nested globs, ranges and literal braces keep their meaning", () => {
  assert.deepEqual(braces.expand("src/{app,{lib,components}}/{1..2}.ts"), ["src/app/1.ts", "src/app/2.ts", "src/lib/1.ts", "src/lib/2.ts", "src/components/1.ts", "src/components/2.ts"]);
  assert.deepEqual(micromatch(["app/a.ts", "lib/b.ts", "other/c.ts"], "{app,lib}/*.ts"), ["app/a.ts", "lib/b.ts"]);
  for (const pattern of ["\\{".repeat(160), '"' + "{".repeat(160) + '"', "[" + "{".repeat(160) + "]"]) {
    assert.doesNotThrow(() => braces.compile(pattern));
  }
});

for (const format of ["e", "f", "g"]) {
  test(`sprintf clamps excessive ${format} precision without an availability error`, () => {
    assert.equal(sprintf(`%.101${format}`, 1.25), sprintf(`%.100${format}`, 1.25));
    assert.equal(sprintf(`%.999999999999999999999999999${format}`, 1.25), sprintf(`%.100${format}`, 1.25));
    assert.equal(sprintf.format(sprintf.parse(`%.101${format}`), ["unused", 1.25]), sprintf(`%.100${format}`, 1.25));
  });
}

test("sprintf preserves valid numeric, named and string formatting", () => {
  assert.equal(sprintf("%.0f", 1.25), "1");
  assert.equal(sprintf("%.0e", 1.25), "1e+0");
  assert.equal(sprintf("%.0g", 1.25), sprintf("%.1g", 1.25));
  assert.equal(sprintf("%(label)s: %(amount).2f", { label: "value", amount: 1.25 }), "value: 1.25");
  assert.equal(sprintf("%.3s", "abcdef"), "abc");
});

test("the actual YAML argparse help consumer still formats correctly", () => {
  const parser = new argparse.ArgumentParser({ prog: "synthetic-yaml", addHelp: true });
  parser.addArgument(["--format"], { help: "Output format" });
  const help = parser.formatHelp();
  assert.match(help, /synthetic-yaml/);
  assert.match(help, /Output format/);
});

test("the actual frameworks reader retains safeLoad and normal YAML merges", async () => {
  const directory = await mkdtemp(join(tmpdir(), "opac-yaml-"));
  try {
    const file = join(directory, "config.yaml");
    await writeFile(file, "defaults: &defaults {label: opac}\nresult: {<<: *defaults, enabled: true}\n");
    const { readConfigFile } = frameworksRequire(join(dirname(frameworksEntry), "read-config-file.js"));
    const result = await readConfigFile(file);
    assert.deepEqual(result.result, { label: "opac", enabled: true });
    const input = "base: &base {__proto__: {polluted: true}}\nresult: {<<: *base}\n";
    const parsed = yaml.safeLoad(input);
    assert.equal(Object.getPrototypeOf(parsed.result), Object.prototype);
    assert.equal({}.polluted, undefined);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("TypeID retains UUID v7 buffer generation and round trips", () => {
  const typeidRequire = createRequire(cliRequire.resolve("typeid-js"));
  const uuid = typeidRequire("uuid");
  const buffer = new Uint8Array(16);
  assert.equal(uuid.v7(undefined, buffer), buffer);
  assert.equal(uuid.version(uuid.stringify(buffer)), 7);
  const { typeid, fromString } = cliRequire("typeid-js");
  const value = typeid("trace").toString();
  assert.equal(fromString(value).toString(), value);
});

test("the actual Sanity archive builder supports file and directory assets", async () => {
  const directory = await mkdtemp(join(tmpdir(), "opac-archive-"));
  try {
    const file = join(directory, "source.js");
    await writeFile(file, "export const synthetic = true;\n");
    const folder = join(directory, "folder");
    await mkdir(folder);
    await writeFile(join(folder, "index.js"), "export default 'synthetic';\n");
    const modulePath = join(dirname(runtimeEntry), "actions/blueprints/assets.js");
    const { pathToB64ZipHash } = await import(pathToFileURL(modulePath).href);
    for (const path of [file, folder]) {
      const result = await pathToB64ZipHash(path);
      assert.match(result.hash, /^[a-f0-9]{64}$/);
      assert.deepEqual(Buffer.from(result.b64, "base64"), result.buffer);
      const Zip = runtimeRequire("adm-zip");
      const entries = new Zip(result.buffer).getEntries();
      assert.equal(entries.length, 1);
      assert.equal(entries[0].entryName, "index.js");
      assert.ok(entries[0].header.size > 0);
      assert.match(entries[0].getData().toString(), /synthetic/);
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});
