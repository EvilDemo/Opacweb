import assert from "node:assert/strict";
import { mock, test } from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const cart = {
  id: "synthetic-cart", checkoutUrl: "https://checkout.example.test/synthetic", totalQuantity: 3,
  lines: [
    { id: "shirt", productTitle: "Synthetic shirt", quantity: 1, cost: { totalAmount: { amount: "20.00", currencyCode: "EUR" } }, merchandise: { id: "shirt", title: "Medium", selectedOptions: [] } },
    { id: "record", productTitle: "Synthetic record", quantity: 2, cost: { totalAmount: { amount: "60.00", currencyCode: "EUR" } }, merchandise: { id: "record", title: "Record", selectedOptions: [] } },
  ],
  cost: { totalAmount: { amount: "80.00", currencyCode: "EUR" }, subtotalAmount: { amount: "80.00", currencyCode: "EUR" } },
};

function Button({ asChild, children, ...props }) {
  delete props.variant;
  delete props.size;
  return asChild ? React.cloneElement(React.Children.only(children), props) : React.createElement("button", props, children);
}
const container = ({ children }) => React.createElement("div", null, children);
const Price = loadTypeScript(new URL("../components/commerce/Price.tsx", import.meta.url), {
  dependencies: { "@/lib/utils": { cn: (...values) => values.filter(Boolean).join(" ") } }, allowImports: ["react/jsx-runtime"],
}).Price;

function setup(surface, overrides = {}) {
  const state = {
    cart: null, isLoading: false, isPending: false, error: null,
    refreshCart: mock.fn(async () => {}), updateQuantity: mock.fn(), removeItem: mock.fn(), ...overrides,
  };
  const exports = loadTypeScript(new URL(`../components/commerce/${surface}.tsx`, import.meta.url), {
    dependencies: {
      "next/image": () => null,
      "next/link": ({ children, ...props }) => React.createElement("a", props, children),
      "@/components/ui/button": { Button },
      "./Price": { Price },
      "./CartContext": { useCartData: () => state, useCartUI: () => ({ setOpenCartSidebar() {} }) },
      // Portals/visibility and actual React scheduling are browser-test concerns.
      "@/components/ui/sheet": Object.fromEntries(["Sheet", "SheetContent", "SheetHeader", "SheetTitle", "SheetDescription", "SheetTrigger", "SheetClose"].map(name => [name, container])),
      react: { ...React, useState: initial => [initial, () => {}], useEffect: () => {} },
    },
    allowImports: ["react/jsx-runtime"],
  });
  const tree = exports[surface]({});
  function find(predicate) {
    function visit(node) {
      if (Array.isArray(node)) return node.flatMap(visit);
      if (!React.isValidElement(node)) return [];
      return [...(predicate(node) ? [node] : []), ...visit(node.props.children)];
    }
    return visit(tree);
  }
  return { state, html: renderToStaticMarkup(tree), find };
}

for (const surface of ["CartPageClient", "CartSidebar"]) {
  test(`${surface} shows first-load failure and retry instead of an empty-cart claim`, async () => {
    const view = setup(surface, { error: "Synthetic internal SDK details must not be displayed" });
    assert.match(view.html, /role="alert"/);
    assert.match(view.html, /couldn&#x27;t load your cart/i);
    assert.doesNotMatch(view.html, /Your cart is empty|Synthetic internal SDK/);
    const [retry] = view.find(node => node.type === Button && node.props.children === "Retry");
    assert.ok(retry);
    assert.equal(Boolean(retry.props.disabled), false);
    await retry.props.onClick();
    assert.equal(view.state.refreshCart.mock.callCount(), 1);
    assert.equal(view.state.updateQuantity.mock.callCount(), 0);
    assert.equal(view.state.removeItem.mock.callCount(), 0);
  });

  test(`${surface} retains line details and totals alongside a safe refresh warning`, () => {
    const view = setup(surface, { cart, error: "Synthetic private provider details" });
    assert.match(view.html, /role="alert"/);
    assert.match(view.html, /couldn&#x27;t refresh your cart/i);
    assert.match(view.html, /Synthetic shirt/);
    assert.match(view.html, /Synthetic record/);
    assert.match(view.html, /Quantity: 1/);
    assert.match(view.html, /Quantity: 2/);
    assert.match(view.html, /€80\.00/);
    assert.doesNotMatch(view.html, /Your cart is empty|Synthetic private provider/);
    const [checkout] = view.find(node => node.props["aria-label"] === "Proceed to checkout");
    assert.ok(checkout);
    assert.equal(Boolean(checkout.props.disabled), false, "Read errors do not introduce a new checkout policy");
    if (surface === "CartSidebar") assert.match(view.html, /Open cart with 3 items/);
  });

  test(`${surface} renders genuine empty states only after error-free reads`, () => {
    for (const snapshot of [null, { ...cart, totalQuantity: 0, lines: [] }]) {
      const view = setup(surface, { cart: snapshot });
      assert.match(view.html, /Your cart is empty/);
      assert.doesNotMatch(view.html, /role="alert"|>Retry</);
    }
  });

  test(`${surface} gives a read error precedence over a previously empty snapshot`, () => {
    const view = setup(surface, { cart: { ...cart, totalQuantity: 0, lines: [] }, error: "Synthetic read error" });
    assert.match(view.html, /role="alert"/);
    assert.doesNotMatch(view.html, /Your cart is empty/);
  });

  test(`${surface} prevents retry while loading and keeps its loading state`, () => {
    const view = setup(surface, { isLoading: true, error: "Synthetic previous read error" });
    assert.match(view.html, /Loading cart/);
    const retries = view.find(node => node.type === Button && node.props.children === "Retry");
    assert.equal(retries.length, 1);
    for (const retry of retries) {
      assert.equal(retry.props.disabled, true);
    }
    assert.doesNotMatch(view.html, /Your cart is empty/);
  });

  test(`${surface} removes the warning and retry when a successful populated read recovers`, () => {
    const view = setup(surface, { cart });
    assert.match(view.html, /Synthetic shirt/);
    assert.match(view.html, /Synthetic record/);
    assert.doesNotMatch(view.html, /role="alert"|>Retry<|Your cart is empty/);
  });

  test(`${surface} preserves pending mutation controls when a read error is present`, () => {
    const view = setup(surface, { cart, error: "Synthetic read error", isPending: true });
    const buttons = view.find(node => /^(Increase|Decrease|Remove|Proceed to checkout)/.test(node.props["aria-label"] ?? ""));
    assert.ok(buttons.length > 0);
    for (const button of buttons) {
      assert.equal(button.props.disabled, true);
    }
  });
}
