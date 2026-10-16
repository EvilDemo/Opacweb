import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { lstatSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const inventoryPath = "plans/010-asset-decisions.json";
const baseline = "17af3a2";
const expectedBytes = 15901818;
const allowedPaths = [
  "aoty-cover-back.webp", "aoty-mode-home.mp4", "cart.svg", "close.svg",
  "esfera3D.gif", "esfera3D.mp4", "esfera3D.webm", "file.svg", "globe.svg", "menu.svg",
  "opac-world.mp4", "social-instagram.svg", "social-youtube.svg", "sphere-lowheight.mp4",
  "sphere-lowheight2.mp4", "sphere-lowheight2_small.webm", "temp_reverse_q80.webp", "window.svg",
].map(name => `public/${name}`);
const args = process.argv.slice(2);
const check = args.includes("--check");
const afterRemoval = args.includes("--after-removal");
if (args.some(arg => !["--report", "--check", "--after-removal"].includes(arg)) ||
    args.length !== new Set(args).size || check === args.includes("--report") || (afterRemoval && !check)) {
  console.error("Usage: node scripts/audit-public-assets.mjs --report | --check [--after-removal]");
  process.exit(1);
}

function git(...gitArgs) {
  return execFileSync("git", gitArgs, { cwd: root, maxBuffer: 32 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
}
function digest(bytes) { return createHash("sha256").update(bytes).digest("hex"); }
function escapePattern(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function fileOrNull(path) {
  try {
    const stat = lstatSync(join(root, path));
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("Expected an ordinary file");
    return readFileSync(join(root, path));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function scanReferences(files, assets) {
  const references = new Map(assets.map(asset => [asset.path, []]));
  const dynamicPaths = [];
  let scannedFiles = 0;
  for (const path of files) {
    if (/^(?:plans|\.git|node_modules|\.next|\.codex|\.agents)\//.test(path) ||
        /(?:^|\/)\.env(?:\.|$)/.test(path) || ["pnpm-lock.yaml", "bun.lock"].includes(path) ||
        path === "scripts/audit-public-assets.mjs" ||
        !/\.(?:[cm]?[jt]sx?|json|css|scss|sass|html|md|txt|ya?ml|svg)$/.test(path)) continue;
    const bytes = fileOrNull(path);
    if (!bytes) continue;
    scannedFiles++;
    const content = bytes.toString("utf8");
    for (const asset of assets) {
      const pattern = new RegExp(`(?:^|[^\\w.-])${escapePattern(basename(asset.path))}(?=$|[^\\w.-])`);
      for (const [index, line] of content.split(/\r?\n/).entries()) {
        // Decode URL escaping as well as handling query strings, CSS url(), and srcSet delimiters.
        const decoded = line.replace(/(?:%[0-9a-f]{2})+/gi, sequence => {
          try { return decodeURIComponent(sequence); } catch { return sequence; }
        });
        if (pattern.test(decoded)) references.get(asset.path).push({ file: path, line: index + 1 });
      }
    }
    if (!/\.[cm]?[jt]sx?$/.test(path)) continue;
    const source = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
    const lines = new Set();
    function visit(node) {
      const template = ts.isTemplateExpression(node) ? [node.head.text, ...node.templateSpans.map(span => span.literal.text)].join(" ") : "";
      const combinedPath = ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken &&
        [node.left, node.right].some(part => ts.isStringLiteralLike(part) && part.text.includes("/"));
      const pathCall = ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) &&
        ["join", "concat"].includes(node.expression.name.text) && /\//.test(node.getText(source));
      if ((template.includes("/") && (/^\//.test(template) || /\.(?:webp|png|jpe?g|svg|gif|mp4|webm|glb|m4a)\b/.test(template))) || combinedPath || pathCall) {
        lines.add(source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1);
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
    for (const line of lines) dynamicPaths.push({ file: path, line });
  }
  return { references, dynamicPaths, scannedFiles };
}

try {
  const inventory = JSON.parse(readFileSync(join(root, inventoryPath), "utf8"));
  const assets = inventory.assets;
  if (inventory.schemaVersion !== 1 || inventory.plannedAt?.commit !== baseline || !Array.isArray(assets) ||
      assets.length !== allowedPaths.length || new Set(assets.map(asset => asset.path)).size !== allowedPaths.length ||
      assets.some(asset => !allowedPaths.includes(asset.path))) throw new Error("Inventory must contain exactly the 18 approved baseline paths");
  if (inventory.totalCandidateBytes !== expectedBytes || assets.reduce((sum, asset) => sum + asset.bytes, 0) !== expectedBytes) {
    throw new Error("Inventory byte total differs from the audited baseline");
  }
  const files = [...new Set(git("ls-files", "--cached", "--others", "--exclude-standard", "-z").toString().split("\0").filter(Boolean))];
  const tracked = new Set(git("ls-files", "-z", "--", "public").toString().split("\0").filter(Boolean));
  const { references, dynamicPaths, scannedFiles } = scanReferences(files, assets);
  const errors = [];
  const counts = { pending: 0, retain: 0, remove: 0 };
  let removeBytes = 0;
  console.log(`Asset review: ${assets.length} candidates, ${expectedBytes} bytes; ${scannedFiles} text source/config files scanned from ${files.length} tracked/nonignored paths.`);
  for (const asset of assets) {
    const issues = [];
    if (Object.keys(asset).some(key => !["path", "url", "bytes", "sha256", "state", "reason", "evidence"].includes(key)) ||
        asset.url !== `/${basename(asset.path)}` || !Number.isSafeInteger(asset.bytes) || asset.bytes < 0 ||
        !/^[0-9a-f]{64}$/.test(asset.sha256) || !Object.hasOwn(counts, asset.state) ||
        typeof asset.reason !== "string" || !asset.reason.trim() || !Array.isArray(asset.evidence) ||
        asset.evidence.some(item => typeof item !== "string" || !item.trim())) throw new Error(`Invalid inventory row: ${asset.path}`);
    counts[asset.state]++;
    const original = git("cat-file", "blob", `${baseline}:${asset.path}`);
    if (original.length !== asset.bytes || digest(original) !== asset.sha256) issues.push("inventory size/hash disagrees with recoverable Git baseline");
    if (!tracked.has(asset.path)) issues.push("path is not tracked; no cleanup allowed");
    const current = fileOrNull(asset.path);
    if (current && (current.length !== asset.bytes || digest(current) !== asset.sha256)) issues.push("working file size/hash drift");
    if (!current && asset.state !== "remove") issues.push("retained/pending file is missing");
    if (check && asset.state === "pending") issues.push("decision is pending");
    if (check && asset.state !== "pending" && !asset.evidence.length) issues.push("decision has no evidence summary");
    if (asset.state === "remove") {
      removeBytes += asset.bytes;
      if (references.get(asset.path).length) issues.push("current local references prevent removal");
      // These attestations record human-reviewed evidence, not automatic external-usage proof or deletion permission.
      const suffix = `path=${asset.path}; reference=`;
      if (!asset.evidence.some(item => item.startsWith(`local-review: no-consumers; ${suffix}`) && item.length > `local-review: no-consumers; ${suffix}`.length)) issues.push("removal lacks path-specific local review");
      const clearance = `external-clearance: ${suffix}`;
      const approval = `owner-approval: accepted-unknown-consumers; ${suffix}`;
      if (!asset.evidence.some(item => [clearance, approval].some(prefix => item.startsWith(prefix) && item.length > prefix.length))) issues.push("removal lacks external clearance or exact-path owner risk acceptance");
      if (dynamicPaths.length && !asset.evidence.some(item => item.startsWith(`dynamic-review: no-consumers; ${suffix}`) && item.length > `dynamic-review: no-consumers; ${suffix}`.length)) issues.push("removal lacks manual dynamic-path review");
      if (afterRemoval && current) issues.push("remove-state file is still present");
    }
    console.log(`${asset.state.toUpperCase()} ${asset.path}: ${asset.bytes} bytes; ${current ? "present" : "absent"}; ${references.get(asset.path).length} literal reference(s); ${issues.length ? issues.join("; ") : "baseline matches"}`);
    for (const reference of references.get(asset.path)) console.log(`  reference: ${reference.file}:${reference.line}`);
    for (const issue of issues) errors.push(`${asset.path}: ${issue}`);
  }
  console.log(`Potential dynamic paths requiring manual review: ${dynamicPaths.length}`);
  for (const location of dynamicPaths) console.log(`  dynamic: ${location.file}:${location.line}`);
  console.log(`Decisions: ${counts.pending} pending, ${counts.retain} retain, ${counts.remove} remove; approved-scope removal bytes: ${removeBytes}.`);
  console.log("Static absence is advisory; CMS/traffic/embed use and evidence attestations require human review. This script never writes or deletes files.");
  if (check && errors.length) { console.error(`Asset check failed: ${errors.length} issue(s).`); process.exitCode = 1; }
  else if (check) console.log(`Asset check passed${afterRemoval ? " (after-removal)" : ""}.`);
} catch (error) {
  // Git/parse errors may contain file data: report only the category for child-process failures.
  console.error(error.status !== undefined ? "Asset audit failed: required read-only Git operation did not succeed." :
    error instanceof SyntaxError ? "Asset audit failed: inventory JSON could not be parsed." : `Asset audit failed: ${error.message}`);
  process.exitCode = 1;
}
