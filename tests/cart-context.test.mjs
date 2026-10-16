import assert from "node:assert/strict";
import { mock, test } from "node:test";
import * as React from "react";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const cart = { id: "synthetic-cart", totalQuantity: 3, lines: [{ id: "shirt", quantity: 1 }, { id: "record", quantity: 2 }] };

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function setup() {
  const hooks = [];
  const reads = [];
  let cursor;
  const getCartAction = mock.fn(() => {
    assert.ok(reads.length, "Every read must have an explicitly scheduled response");
    return reads.shift();
  });
  // This harness exercises the actual provider's read transitions, not React scheduling.
  // Real useOptimistic rollback and effect behavior are verified in the browser separately.
  const { CartProvider } = loadTypeScript(new URL("../components/commerce/CartContext.tsx", import.meta.url), {
    dependencies: {
      react: {
        ...React,
        useState(initial) {
          const index = cursor++;
          if (!(index in hooks)) hooks[index] = typeof initial === "function" ? initial() : initial;
          return [hooks[index], value => { hooks[index] = typeof value === "function" ? value(hooks[index]) : value; }];
        },
        useRef(initial) {
          const index = cursor++;
          if (!(index in hooks)) hooks[index] = { current: initial };
          return hooks[index];
        },
        useCallback: callback => callback,
        useEffect: () => {},
      },
      "@/lib/shopify/actions": { getCartAction },
      "./useCartMutations": { useCartMutations: ({ cart }) => ({ optimisticCart: cart, isPending: false }) },
    },
    allowImports: ["react/jsx-runtime"],
    logger: { error: mock.fn() },
  });
  const render = () => {
    cursor = 0;
    return CartProvider({ children: null }).props.value;
  };
  return {
    render, getCartAction,
    async load(value) {
      reads.push(Promise.resolve({ cart: value, error: null }));
      await render().refreshCart();
    },
    startRead() {
      const read = deferred();
      reads.push(read.promise);
      return { ...read, completed: render().refreshCart() };
    },
  };
}

for (const failure of ["error result", "rejected read"]) {
  test(`${failure} preserves the last successful multi-line cart while a refresh settles`, async () => {
    const fixture = setup();
    await fixture.load(cart);
    assert.equal(fixture.render().cart, cart);
    const read = fixture.startRead();
    assert.equal(fixture.render().isLoading, true);
    assert.equal(fixture.render().cart, cart);
    if (failure === "error result") read.resolve({ cart: null, error: "Synthetic provider unavailable" });
    else read.reject(new Error("Synthetic transport failure"));
    await read.completed;
    const state = fixture.render();
    assert.equal(state.cart, cart);
    assert.equal(state.cart.totalQuantity, 3);
    assert.deepEqual(state.cart.lines, cart.lines);
    assert.ok(state.error);
    assert.equal(state.isLoading, false);
    assert.equal(fixture.getCartAction.mock.callCount(), 2, "One initial read and one refresh; no automatic retry");
  });

  test(`${failure} on first load ends loading without claiming a successful cart`, async () => {
    const fixture = setup();
    const read = fixture.startRead();
    assert.equal(fixture.render().isLoading, true);
    if (failure === "error result") read.resolve({ cart: null, error: "Synthetic first-read failure" });
    else read.reject(new Error("Synthetic first-read rejection"));
    await read.completed;
    assert.equal(fixture.render().cart, null);
    assert.ok(fixture.render().error);
    assert.equal(fixture.render().isLoading, false);
    assert.equal(fixture.getCartAction.mock.callCount(), 1);
  });
}

test("an explicit retry can fail again and then replace the snapshot with fresh quantities", async () => {
  const fixture = setup();
  await fixture.load(cart);
  for (let attempt = 0; attempt < 2; attempt++) {
    const read = fixture.startRead();
    read.resolve({ cart: null, error: "Synthetic temporary failure" });
    await read.completed;
    assert.equal(fixture.render().cart, cart);
  }
  const read = fixture.startRead();
  assert.equal(fixture.render().error, null);
  assert.equal(fixture.render().isLoading, true);
  assert.equal(fixture.render().cart, cart);
  const updated = { ...cart, totalQuantity: 4, lines: [{ id: "shirt", quantity: 2 }, cart.lines[1]] };
  read.resolve({ cart: updated, error: null });
  await read.completed;
  assert.equal(fixture.render().cart, updated);
  assert.equal(fixture.render().error, null);
  assert.equal(fixture.render().isLoading, false);
  assert.equal(fixture.getCartAction.mock.callCount(), 4);
});

for (const [name, authoritative] of [["confirmed absence", null], ["a successful empty cart", { ...cart, totalQuantity: 0, lines: [] }]]) {
  test(`${name} clears the prior cart and error`, async () => {
    const fixture = setup();
    await fixture.load(cart);
    const failed = fixture.startRead();
    failed.resolve({ cart: null, error: "Synthetic failure before recovery" });
    await failed.completed;
    await fixture.load(authoritative);
    assert.equal(fixture.render().cart, authoritative);
    assert.equal(fixture.render().error, null);
    assert.equal(fixture.render().isLoading, false);
  });
}
