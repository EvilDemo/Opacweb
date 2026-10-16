import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

for (const enabled of [false, true]) {
  const navigation = loadTypeScript(new URL("../lib/constants.ts", import.meta.url), {
    env: { NEXT_PUBLIC_SHOP_ENABLED: String(enabled) },
  });

  test(`About has a valid default destination and retains both children with shop ${enabled}`, () => {
    const about = navigation.getVisibleNavItems().find(item => item.label === "About");
    assert.equal(about.href, "/about/us");
    assert.deepEqual(Array.from(about.subItems, item => [item.label, item.href]), [["Us", "/about/us"], ["You", "/about/you"]]);
  });

  test(`public navigation excludes Shop and the separate shop item respects mode ${enabled}`, () => {
    assert.deepEqual(Array.from(navigation.getVisibleNavItems(), item => item.label), ["Media", "Radio", "About", "Contact"]);
    assert.equal(navigation.isShopEnabled(), enabled);
    assert.equal(navigation.getShopItem()?.href ?? null, enabled ? "/shop" : null);
  });

  test(`the actual footer renders About using the shared destination with shop ${enabled}`, () => {
    const { default: Footer } = loadTypeScript(new URL("../components/Footer.tsx", import.meta.url), {
      allowImports: ["react/jsx-runtime"],
      dependencies: {
        "@/lib/constants": navigation,
        "next/link": ({ href, children }) => createElement("a", { href }, children),
        "next/image": () => null,
        "@/components/ViewportVideo": () => null,
        "@/components/LazyNewsletterForm": () => null,
        "@/components/ui/button": { Button: ({ children }) => children },
        "@/components/ui/separator": { Separator: () => null },
      },
    });
    assert.match(renderToStaticMarkup(createElement(Footer)), /<a href="\/about\/us">About<\/a>/);
  });
}
