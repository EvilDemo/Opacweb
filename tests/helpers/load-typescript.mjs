import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Script } from "node:vm";
import ts from "typescript";

/**
 * Load production code with fresh module state and explicitly supplied dependencies.
 * Returned objects and mock argument arrays can have VM prototypes; compare their values.
 */
export function loadTypeScript(sourceUrl, { dependencies = {}, allowImports = [], env = {}, logger = console } = {}) {
  const filename = fileURLToPath(sourceUrl);
  if (!/\.tsx?$/.test(filename)) {
    throw new Error(`Expected a TypeScript source file: ${filename}`);
  }

  const { outputText, diagnostics = [] } = ts.transpileModule(readFileSync(sourceUrl, "utf8"), {
    fileName: filename,
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });
  const errors = diagnostics.filter(({ category }) => category === ts.DiagnosticCategory.Error);
  if (errors.length) {
    throw new Error(errors.map(({ messageText }) => ts.flattenDiagnosticMessageText(messageText, "\n")).join("\n"));
  }

  const requireFromSource = createRequire(sourceUrl);
  const loadedModule = { exports: {} };
  // This isolates test state; it is not a security sandbox for untrusted code.
  new Script(outputText, { filename }).runInNewContext({
    module: loadedModule,
    exports: loadedModule.exports,
    require(specifier) {
      if (Object.hasOwn(dependencies, specifier)) return dependencies[specifier];
      if (allowImports.includes(specifier)) return requireFromSource(specifier);
      throw new Error(`Unmocked import "${specifier}" in ${filename}`);
    },
    __filename: filename,
    __dirname: dirname(filename),
    // Do not inherit application credentials or mutate the test runner's environment.
    process: { env: { ...env } },
    console: logger,
    Request,
    Response,
    Headers,
    URL,
    Buffer,
    Error,
    TypeError,
    SyntaxError,
    RangeError,
  });
  return loadedModule.exports;
}
