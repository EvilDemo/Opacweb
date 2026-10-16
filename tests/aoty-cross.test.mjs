import assert from "node:assert/strict";
import { mock, test } from "node:test";
import * as React from "react";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

function loadCross(WebGLRenderer) {
  return loadTypeScript(new URL("../components/three/A0TYRotatingCross.tsx", import.meta.url), {
    dependencies: {
      "@react-three/fiber": { Canvas: "canvas-fixture" },
      "@react-three/drei": { PerspectiveCamera: "camera-fixture" },
      "@react-three/postprocessing": {},
      three: { WebGLRenderer },
      react: { ...React, useCallback: callback => callback },
    },
    allowImports: ["react/jsx-runtime"],
  }).A0TYRotatingCross;
}

// Exercise the same renderer initialization contract as Fiber's Canvas.
function initialize(Cross, props, WebGLRenderer) {
  const canvas = Cross(props).props.children;
  const defaults = { canvas: {}, alpha: true, antialias: true, powerPreference: "high-performance" };
  return typeof canvas.props.gl === "function"
    ? canvas.props.gl(defaults)
    : new WebGLRenderer({ ...defaults, ...canvas.props.gl });
}

test("renderer startup failure reports unavailability and preserves the original error", () => {
  const failure = new Error("Error creating WebGL context.");
  class WebGLRenderer { constructor() { throw failure; } }
  const onError = mock.fn();
  const Cross = loadCross(WebGLRenderer);
  assert.throws(() => initialize(Cross, { onError }, WebGLRenderer), error => error === failure);
  assert.equal(onError.mock.callCount(), 1);
});

test("successful renderer startup preserves canvas options without reporting failure", () => {
  class WebGLRenderer { constructor(options) { this.options = options; } }
  const onError = mock.fn();
  const Cross = loadCross(WebGLRenderer);
  const renderer = initialize(Cross, { onError }, WebGLRenderer);
  assert.ok(renderer.options.canvas);
  assert.equal(renderer.options.antialias, false);
  assert.equal(renderer.options.alpha, true);
  assert.equal(renderer.options.depth, true);
  assert.equal(renderer.options.stencil, false);
  assert.equal(onError.mock.callCount(), 0);
});

function createControl({ desktop = false } = {}) {
  const states = [];
  let cursor;
  const Control = loadTypeScript(new URL("../components/AotyCross.tsx", import.meta.url), {
    dependencies: {
      react: {
        ...React,
        useState(initial) {
          const index = cursor++;
          if (!(index in states)) states[index] = initial;
          return [states[index], value => { states[index] = typeof value === "function" ? value(states[index]) : value; }];
        },
        useCallback: callback => callback,
        useRef: () => ({ current: null }),
        useEffect: () => {},
        useSyncExternalStore: () => desktop,
      },
      "next/dynamic": () => "live-cross-fixture",
      "next/image": "image-fixture",
    },
    allowImports: ["react/jsx-runtime"],
  }).default;
  return () => {
    cursor = 0;
    const [boundary, picture, button] = Control().props.children;
    return { live: boundary && boundary.props.children, poster: picture.props.children[1], button };
  };
}

test("mobile failure keeps the poster, retires the canvas, and permits a fresh activation", () => {
  const render = createControl();
  let view = render();
  assert.equal(view.button.props.children, "Interact with 3D");
  view.button.props.onClick();
  view = render();
  assert.equal(view.button.props.children, "Cancel 3D");
  view.live.props.onError();
  view = render();
  assert.equal(view.button.props.children, "3D unavailable · use poster");
  assert.equal(view.live, false);
  assert.match(view.poster.props.className, /opacity-100/);
  view.button.props.onClick();
  view = render();
  assert.equal(view.button.props.children, "Interact with 3D");
  assert.equal(view.button.props["aria-pressed"], false);
  view.button.props.onClick();
  view = render();
  view.live.props.onReady();
  view = render();
  assert.equal(view.button.props.children, "Pause 3D");
  assert.match(view.poster.props.className, /opacity-0\b/);
  view.button.props.onClick();
  view = render();
  assert.equal(view.live, false);
  assert.match(view.poster.props.className, /opacity-100/);
});

test("cancelling startup restores the mobile poster control", () => {
  const render = createControl();
  render().button.props.onClick();
  render().button.props.onClick();
  const view = render();
  assert.equal(view.button.props.children, "Interact with 3D");
  assert.equal(view.live, false);
  assert.match(view.poster.props.className, /opacity-100/);
});

test("desktop failure preserves the poster without adding an activation control", () => {
  const render = createControl({ desktop: true });
  render().live.props.onError();
  const view = render();
  assert.equal(view.live, false);
  assert.equal(view.button, false);
  assert.match(view.poster.props.className, /opacity-100/);
});
