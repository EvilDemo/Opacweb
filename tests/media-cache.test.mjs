import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { encodeSignatureHeader, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const source = new URL("../lib/mediaData.ts", import.meta.url);
const secret = "synthetic-gallery-webhook-secret";
const pictureIds = ["synthetic-picture-a", "synthetic-picture-b"];

function setup({ configured = true, mode = "production", failure, gallery = { gallery: ["https://images.example.test/gallery.jpg"] } } = {}) {
  const pictures = pictureIds.map(_id => ({ _id, title: _id }));
  const fetch = mock.fn(async (query) => {
    if (failure) throw failure;
    return query === "pictures-query" ? pictures : query === "gallery-query" ? gallery : [];
  });
  const media = loadTypeScript(source, {
    dependencies: { "./sanity": { sanityClient: { fetch }, picturesQuery: "pictures-query", galleryQuery: "gallery-query", videosQuery: "videos-query", musicQuery: "music-query", radioQuery: "radio-query" } },
    allowImports: ["react"],
    env: { NODE_ENV: mode, ...(configured ? { NEXT_PUBLIC_SANITY_PROJECT_ID: "synthetic-project" } : {}) },
    logger: { error: mock.fn() },
  });
  const revalidateTag = mock.fn();
  const route = loadTypeScript(new URL("../app/api/sanity-webhook/route.ts", import.meta.url), {
    dependencies: { "next/cache": { revalidateTag } }, allowImports: ["next/server", "@sanity/webhook"],
    env: { NODE_ENV: "production", SANITY_WEBHOOK_SECRET: secret }, logger: { error: mock.fn(), warn: mock.fn(), debug: mock.fn() },
  });
  return { media, fetch, route, revalidateTag, pictures, gallery };
}

async function pictureReads(fixture) {
  await fixture.media.getPictures();
  for (const id of pictureIds) await fixture.media.getGallery(id);
  return fixture.fetch.mock.calls.map(({ arguments: args }) => ({ query: args[0], variables: args[1], ...args[2].next }));
}

async function webhook(fixture, payload, { signingSecret = secret, signature } = {}) {
  const rawBody = JSON.stringify(payload);
  const headers = { "content-type": "application/json" };
  if (signature !== null) headers[SIGNATURE_HEADER_NAME] = signature ?? await encodeSignatureHeader(rawBody, Date.now(), signingSecret);
  return fixture.route.POST(new Request("https://website.example.test/api/sanity-webhook", { method: "POST", headers, body: rawBody }));
}

test("listing and two galleries preserve their data, production TTL, and gallery-specific tags", async () => {
  const fixture = setup();
  assert.equal(await fixture.media.getPictures(), fixture.pictures);
  for (const id of pictureIds) assert.equal(await fixture.media.getGallery(id), fixture.gallery);
  const calls = fixture.fetch.mock.calls;
  assert.equal(calls.length, 3);
  assert.deepEqual([...calls[0].arguments[2].next.tags], ["pictures"]);
  for (const [index, id] of pictureIds.entries()) {
    const args = calls[index + 1].arguments;
    assert.equal(args[0], "gallery-query");
    assert.equal(args[1].id, id);
    const tags = [...args[2].next.tags];
    assert.ok(tags.includes("gallery"));
    assert.ok(tags.includes(`gallery-${id}`));
  }
  for (const { arguments: args } of calls) assert.equal(args[2].next.revalidate, 3600);
});

for (const payload of [{ _type: "pictures", _id: pictureIds[0] }, { _id: pictureIds[0] }]) {
  test(`a real signed ${payload._type ? "picture update" : "ID-only deletion"} invalidates a shared listing/gallery tag`, async () => {
    const fixture = setup();
    const reads = await pictureReads(fixture);
    const response = await webhook(fixture, payload);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).revalidated, true);
    const invalidated = fixture.revalidateTag.mock.calls.map(({ arguments: args }) => {
      assert.deepEqual({ ...args[1] }, { expire: 0 });
      return args[0];
    });
    const common = [...reads[0].tags].filter(tag => invalidated.includes(tag) && reads.slice(1).every(read => read.tags.includes(tag)));
    assert.ok(common.length > 0, "the authenticated event must invalidate a tag shared by the listing and both galleries");
  });
}

for (const _type of ["video", "music", "radio", "unknown-synthetic-type"]) {
  test(`signed ${_type} events leave picture listing/gallery caches alone`, async () => {
    const fixture = setup();
    const reads = await pictureReads(fixture);
    assert.equal((await webhook(fixture, { _type })).status, 200);
    for (const { arguments: args } of fixture.revalidateTag.mock.calls) {
      for (const read of reads) assert.equal(read.tags.includes(args[0]), false);
    }
    assert.equal(fixture.revalidateTag.mock.callCount(), _type === "unknown-synthetic-type" ? 0 : 1);
  });
}

for (const options of [{ signature: null }, { signature: "forged-synthetic-signature" }, { signingSecret: "wrong-synthetic-secret" }]) {
  test(`unverified picture events cannot invalidate caches (${Object.keys(options)[0]}: ${String(Object.values(options)[0])})`, async () => {
    const fixture = setup();
    assert.equal((await webhook(fixture, { _type: "pictures", _id: pictureIds[0] }, options)).status, 401);
    assert.equal(fixture.revalidateTag.mock.callCount(), 0);
  });
}

test("other media retain their existing tags and production TTL", async () => {
  const fixture = setup();
  for (const [method, tag] of [["getVideos", "videos"], ["getMusic", "music"], ["getRadio", "radio"]]) {
    assert.deepEqual(await fixture.media[method](), []);
    const args = fixture.fetch.mock.calls.at(-1).arguments;
    assert.deepEqual([...args[2].next.tags], [tag]);
    assert.equal(args[2].next.revalidate, 3600);
  }
});

test("development picture/gallery reads retain zero revalidation time", async () => {
  const fixture = setup({ mode: "development" });
  for (const read of await pictureReads(fixture)) assert.equal(read.revalidate, 0);
});

test("a missing gallery remains null", async () => {
  const fixture = setup({ gallery: null });
  assert.equal(await fixture.media.getGallery(pictureIds[0]), null);
});

test("provider failures retain the existing empty-list and null-gallery fallbacks", async () => {
  const fixture = setup({ failure: new Error("synthetic provider failure") });
  assert.equal((await fixture.media.getPictures()).length, 0);
  assert.equal(await fixture.media.getGallery(pictureIds[0]), null);
});

test("unconfigured picture/gallery reads skip the provider and retain their fallbacks", async () => {
  const fixture = setup({ configured: false });
  assert.equal((await fixture.media.getPictures()).length, 0);
  assert.equal(await fixture.media.getGallery(pictureIds[0]), null);
  assert.equal(fixture.fetch.mock.callCount(), 0);
});
