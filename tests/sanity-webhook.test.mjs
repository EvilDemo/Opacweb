import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mock, test } from "node:test";
import { encodeSignatureHeader, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const source = new URL("../app/api/sanity-webhook/route.ts", import.meta.url);
const secret = "synthetic-sanity-webhook-secret";
const timestamp = 1792022400000;
const validBody = JSON.stringify({ _type: "pictures", _id: "fixture-picture" });

function sign(rawBody, signingSecret = secret) {
  const digest = createHmac("sha256", signingSecret).update(`${timestamp}.${rawBody}`).digest("base64url");
  return `t=${timestamp},v1=${digest}`;
}

function setup(options = {}) {
  const { verifier, cacheError } = options;
  const configuredSecret = Object.hasOwn(options, "configuredSecret") ? options.configuredSecret : secret;
  const cache = { revalidateTag: mock.fn(() => { if (cacheError) throw cacheError; }) };
  const logger = { debug: mock.fn(), warn: mock.fn(), error: mock.fn() };
  const dependencies = { "next/cache": cache };
  if (verifier) dependencies["@sanity/webhook"] = { SIGNATURE_HEADER_NAME, isValidSignature: verifier };
  const route = loadTypeScript(source, {
    dependencies,
    allowImports: ["next/server", "@sanity/webhook"],
    env: { NODE_ENV: "production", SANITY_WEBHOOK_SECRET: configuredSecret },
    logger,
  });
  return { route, cache, logger };
}

function request(rawBody = validBody, signature = sign(rawBody)) {
  const headers = { "content-type": "application/json" };
  if (signature !== null) headers[SIGNATURE_HEADER_NAME] = signature;
  const result = new Request("https://website.example.test/api/sanity-webhook", {
    method: "POST", headers, body: rawBody,
  });
  result.text = mock.fn(result.text.bind(result));
  result.json = mock.fn(() => { throw new Error("The raw body must be verified before parsing"); });
  return result;
}

function noInvalidation(fixture) {
  assert.equal(fixture.cache.revalidateTag.mock.callCount(), 0);
}

test("the independent fixture signer matches Sanity's public header encoder", async () => {
  assert.equal(sign(validBody), await encodeSignatureHeader(validBody, timestamp, secret));
});

for (const configuredSecret of [undefined, "", " \t\n"]) {
  test(`missing or blank configuration fails closed (${JSON.stringify(configuredSecret)})`, async () => {
    const fixture = setup({ configuredSecret });
    const incoming = request();
    const response = await fixture.route.POST(incoming);
    assert.equal(response.status, 500);
    assert.equal(incoming.text.mock.callCount(), 0);
    assert.equal(incoming.json.mock.callCount(), 0);
    noInvalidation(fixture);
  });
}

test("a missing signature is rejected without consuming the body", async () => {
  const fixture = setup();
  const incoming = request("{malformed", null);
  assert.equal((await fixture.route.POST(incoming)).status, 401);
  assert.equal(incoming.text.mock.callCount(), 0);
  assert.equal(incoming.json.mock.callCount(), 0);
  noInvalidation(fixture);
});

for (const [name, rawBody, signature] of [
  ["forged nonempty header", validBody, "forged-signature"],
  ["malformed header", validBody, "t=invalid,v1=invalid"],
  ["wrong secret", validBody, sign(validBody, "other-synthetic-secret")],
  ["changed body", validBody.replace("fixture-picture", "changed-picture"), sign(validBody)],
  ["reserialized body", JSON.stringify(JSON.parse(validBody), null, 2), sign(validBody)],
  ["invalid signature and malformed JSON", "{malformed", sign(validBody)],
]) {
  test(`the real verifier denies ${name}`, async () => {
    const fixture = setup();
    const incoming = request(rawBody, signature);
    assert.equal((await fixture.route.POST(incoming)).status, 401);
    assert.equal(incoming.text.mock.callCount(), 1);
    assert.equal(incoming.json.mock.callCount(), 0);
    noInvalidation(fixture);
  });
}

test("authenticated malformed JSON receives 400", async () => {
  const fixture = setup();
  assert.equal((await fixture.route.POST(request("{malformed"))).status, 400);
  noInvalidation(fixture);
});

for (const body of [null, [], ["pictures"], "pictures", 123, true, { _type: null }, { _type: 3 }, { _type: [] }, { _id: null }, { _id: 3 }, { _type: "pictures", _id: {} }, {}, { _type: "" }]) {
  test(`authenticated invalid payload receives 400: ${JSON.stringify(body)}`, async () => {
    const fixture = setup();
    assert.equal((await fixture.route.POST(request(JSON.stringify(body)))).status, 400);
    noInvalidation(fixture);
  });
}

for (const documentType of ["unrecognized", "constructor", "toString", "__proto__"]) {
  test(`authenticated unknown type ${documentType} is a successful no-op`, async () => {
    const fixture = setup();
    const response = await fixture.route.POST(request(JSON.stringify({ _type: documentType })));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).documentType, documentType);
    noInvalidation(fixture);
  });
}

for (const [documentType, tag] of [["pictures", "pictures"], ["video", "videos"], ["music", "music"], ["radio", "radio"]]) {
  test(`a real signed ${documentType} payload preserves its invalidation intent`, async () => {
    const fixture = setup();
    const rawBody = ` { "_type": "${documentType}", "_id": "synthetic-ação-🎵" }\n`;
    const incoming = request(rawBody, await encodeSignatureHeader(rawBody, timestamp, secret));
    const response = await fixture.route.POST(incoming);
    const result = await response.json();
    assert.equal(response.status, 200);
    assert.equal(result.revalidated, true);
    assert.equal(result.tag, tag);
    assert.equal(result.documentId, "synthetic-ação-🎵");
    assert.equal(incoming.text.mock.callCount(), 1);
    assert.equal(incoming.json.mock.callCount(), 0);
    assert.equal(fixture.cache.revalidateTag.mock.callCount(), 1);
    const args = fixture.cache.revalidateTag.mock.calls[0].arguments;
    assert.equal(args.length, 2);
    assert.equal(args[0], tag);
    assert.deepEqual({ ...args[1] }, { expire: 0 });
  });
}

test("the configured secret is trimmed and a document ID is optional for typed events", async () => {
  const fixture = setup({ configuredSecret: `  ${secret}\n` });
  const response = await fixture.route.POST(request(JSON.stringify({ _type: "music" })));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).tag, "music");
  assert.equal(fixture.cache.revalidateTag.mock.callCount(), 1);
  assert.deepEqual({ ...fixture.cache.revalidateTag.mock.calls[0].arguments[1] }, { expire: 0 });
});

test("an authenticated ID-only deletion preserves all four invalidation intents", async () => {
  const fixture = setup();
  const response = await fixture.route.POST(request(JSON.stringify({ _id: "deleted-fixture" })));
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.operation, "delete");
  assert.equal(result.documentId, "deleted-fixture");
  assert.deepEqual(result.tags, ["pictures", "videos", "music", "radio"]);
  assert.deepEqual(fixture.cache.revalidateTag.mock.calls.map(({ arguments: args }) => args[0]), result.tags);
  for (const { arguments: args } of fixture.cache.revalidateTag.mock.calls) {
    assert.equal(args.length, 2);
    assert.deepEqual({ ...args[1] }, { expire: 0 });
  }
});

for (const verifierResult of [false, undefined, "true", 1]) {
  test(`only an awaited literal true verifier result permits processing (${String(verifierResult)})`, async () => {
    const verifier = mock.fn(async () => verifierResult);
    const fixture = setup({ verifier });
    assert.equal((await fixture.route.POST(request())).status, 401);
    assert.equal(verifier.mock.callCount(), 1);
    noInvalidation(fixture);
  });
}

for (const failure of ["body read", "verifier", "cache"]) {
  test(`unexpected ${failure} failure returns a generic 500 without leaking error details`, async () => {
    const privateError = new Error("synthetic-private-detail-must-not-leak");
    const fixture = setup({
      verifier: failure === "verifier" ? async () => { throw privateError; } : undefined,
      cacheError: failure === "cache" ? privateError : undefined,
    });
    const incoming = request();
    if (failure === "body read") incoming.text = mock.fn(async () => { throw privateError; });
    const response = await fixture.route.POST(incoming);
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { message: "Error processing webhook" });
    const logs = JSON.stringify(fixture.logger.error.mock.calls.map(({ arguments: args }) => [...args]));
    assert.equal(logs.includes(privateError.message), false);
    for (const { arguments: args } of fixture.logger.error.mock.calls) assert.equal(args.includes(privateError), false);
    if (failure !== "cache") noInvalidation(fixture);
  });
}

test("the reachability GET remains available without signing configuration", async () => {
  const fixture = setup({ configuredSecret: null });
  const response = await fixture.route.GET();
  assert.equal(response.status, 200);
  assert.equal((await response.json()).message, "Sanity webhook endpoint is working");
  noInvalidation(fixture);
});
