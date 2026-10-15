import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

// Use the project's compiler so these tests also run on Next.js-supported Node 20.
const source = readFileSync(new URL("../lib/cart-state.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { applyCartUpdate, createCartMutationLock } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

function deferred() {
  let resolve;
  const promise = new Promise((complete) => { resolve = complete; });
  return { promise, resolve };
}

const cart = { id: "cart", totalQuantity: 5, lines: [{ id: "first", quantity: 3 }, { id: "second", quantity: 2 }] };

test("optimistic removal subtracts the whole line and preserves the original cart", () => {
  const result = applyCartUpdate(cart, { type: "remove", lineId: "first" });
  assert.equal(result.totalQuantity, 2);
  assert.deepEqual(result.lines, [{ id: "second", quantity: 2 }]);
  assert.equal(cart.lines.length, 2);
  assert.equal(cart.totalQuantity, 5);
});

test("optimistic quantities update the shared count and tolerate missing carts", () => {
  assert.equal(applyCartUpdate(cart, { type: "update", lineId: "second", quantity: 4 }).totalQuantity, 7);
  assert.equal(applyCartUpdate(null, { type: "remove", lineId: "first" }), null);
  assert.equal(applyCartUpdate(cart, { type: "remove", lineId: "unknown" }).totalQuantity, 5);
});

test("in-flight mutations reject overlapping requests until the real response settles", async () => {
  const run = createCartMutationLock();
  const response = deferred();
  const calls = [];
  const first = run(async () => { calls.push("first"); await response.promise; calls.push("complete"); });
  await run(async () => { calls.push("overlap"); });
  assert.deepEqual(calls, ["first"]);
  response.resolve();
  await first;
  await run(async () => { calls.push("retry"); });
  assert.deepEqual(calls, ["first", "complete", "retry"]);
});

test("failed requests release the lock and separate carts do not block one another", async () => {
  const run = createCartMutationLock();
  await assert.rejects(run(async () => { throw new Error("network unavailable"); }), /network unavailable/);
  let retried = false;
  await run(async () => { retried = true; });
  assert.equal(retried, true);
  const response = deferred();
  const first = run(() => response.promise);
  let independent = false;
  await createCartMutationLock()(async () => { independent = true; });
  assert.equal(independent, true);
  response.resolve();
  await first;
});
