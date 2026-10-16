import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const source = new URL("../lib/shopify/cart-operations.ts", import.meta.url);
const existing = { id: "synthetic-existing", lines: [{ id: "shirt" }, { id: "record" }] };
const replacement = { id: "synthetic-new", lines: [{ id: "new-line" }] };

function setup({ configured = true, addError, probeError, probe = existing, createError } = {}) {
  const order = [];
  const provider = {
    createCart: mock.fn(async () => { order.push("create"); if (createError) throw createError; return replacement; }),
    addToCart: mock.fn(async () => { order.push("add"); if (addError) throw addError; return existing; }),
    getCart: mock.fn(async () => { order.push("probe"); if (probeError) throw probeError; return probe; }),
  };
  const operations = loadTypeScript(source, { dependencies: {
    "./cart": provider, "./constants": { isShopifyConfigured: () => configured },
  } });
  return { operations, provider, order };
}

test("without an existing ID the operation creates once and does not probe or add", async () => {
  const fixture = setup();
  assert.equal(await fixture.operations.addItemToCart(undefined, "synthetic-variant", 3), replacement);
  assert.deepEqual(fixture.order, ["create"]);
  assert.deepEqual([...fixture.provider.createCart.mock.calls[0].arguments], ["synthetic-variant", 3]);
});

test("successful add preserves the existing cart without a probe or replacement", async () => {
  const fixture = setup();
  assert.equal(await fixture.operations.addItemToCart(existing.id, "synthetic-variant", 2), existing);
  assert.deepEqual(fixture.order, ["add"]);
  assert.deepEqual([...fixture.provider.addToCart.mock.calls[0].arguments], [existing.id, "synthetic-variant", 2]);
});

for (const reason of ["synthetic network timeout", "synthetic out of stock", "synthetic invalid quantity"]) {
  test(`failed add with a surviving multi-line cart does not replace or retry: ${reason}`, async () => {
    const addError = new Error(reason);
    const fixture = setup({ addError });
    await assert.rejects(fixture.operations.addItemToCart(existing.id, "synthetic-variant", 1), error => error === addError);
    assert.deepEqual(fixture.order, ["add", "probe"]);
    assert.deepEqual([...fixture.provider.getCart.mock.calls[0].arguments], [existing.id]);
    assert.equal(fixture.provider.createCart.mock.callCount(), 0);
    assert.equal(fixture.provider.addToCart.mock.callCount(), 1);
    assert.equal(existing.lines.length, 2);
  });
}

test("a failed probe preserves the original add error and never retries the mutation", async () => {
  const addError = new Error("synthetic add timed out");
  const fixture = setup({ addError, probeError: new Error("synthetic probe timed out") });
  await assert.rejects(fixture.operations.addItemToCart(existing.id, "synthetic-variant", 1), error => error === addError);
  assert.deepEqual(fixture.order, ["add", "probe"]);
  assert.equal(fixture.provider.createCart.mock.callCount(), 0);
});

test("only explicit null permits one replacement with the requested line", async () => {
  const fixture = setup({ addError: new Error("synthetic expired cart"), probe: null });
  assert.equal(await fixture.operations.addItemToCart(existing.id, "synthetic-variant", 4), replacement);
  assert.deepEqual(fixture.order, ["add", "probe", "create"]);
  assert.deepEqual([...fixture.provider.createCart.mock.calls[0].arguments], ["synthetic-variant", 4]);
});

test("replacement failure preserves the original add error", async () => {
  const addError = new Error("synthetic original add failure");
  const fixture = setup({ addError, probe: null, createError: new Error("synthetic create failure") });
  await assert.rejects(fixture.operations.addItemToCart(existing.id, "synthetic-variant", 1), error => error === addError);
  assert.deepEqual(fixture.order, ["add", "probe", "create"]);
});

test("first-cart creation failure is propagated without probing", async () => {
  const createError = new Error("synthetic create failure");
  const fixture = setup({ createError });
  await assert.rejects(fixture.operations.addItemToCart(undefined, "synthetic-variant", 1), error => error === createError);
  assert.deepEqual(fixture.order, ["create"]);
});

for (const cartId of [undefined, existing.id]) {
  test(`missing configuration rejects without any provider calls (${cartId ?? "no ID"})`, async () => {
    const fixture = setup({ configured: false });
    await assert.rejects(fixture.operations.addItemToCart(cartId, "synthetic-variant", 1), /Shopify is not configured/);
    assert.deepEqual(fixture.order, []);
  });
}

test("an explicit later user retry succeeds against the original cart", async () => {
  const fixture = setup({ addError: new Error("synthetic transient failure") });
  await assert.rejects(fixture.operations.addItemToCart(existing.id, "synthetic-variant", 1));
  fixture.provider.addToCart.mock.mockImplementation(async () => existing);
  assert.equal(await fixture.operations.addItemToCart(existing.id, "synthetic-variant", 1), existing);
  assert.equal(fixture.provider.addToCart.mock.callCount(), 2);
  assert.equal(fixture.provider.getCart.mock.callCount(), 1);
  assert.equal(fixture.provider.createCart.mock.callCount(), 0);
});
