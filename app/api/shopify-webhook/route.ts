import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;
const SHOPIFY_WEBHOOK_ALLOWED_TOPICS = new Set([
  "products/create",
  "products/update",
  "products/delete",
  "inventory_levels/update",
]);

function isSignatureValid(rawBody: string, signature: string) {
  if (!SHOPIFY_WEBHOOK_SECRET) {
    console.warn("SHOPIFY_WEBHOOK_SECRET is not configured. Skipping signature verification.");
    return true;
  }

  const digest = crypto
    .createHmac("sha256", SHOPIFY_WEBHOOK_SECRET)
    .update(rawBody, "utf8")
    .digest("base64");

  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-shopify-hmac-sha256");
    const topic = request.headers.get("x-shopify-topic");

    if (!signature) {
      return NextResponse.json({ message: "Missing Shopify signature" }, { status: 401 });
    }

    if (!isSignatureValid(rawBody, signature)) {
      return NextResponse.json({ message: "Invalid Shopify signature" }, { status: 401 });
    }

    if (topic && !SHOPIFY_WEBHOOK_ALLOWED_TOPICS.has(topic)) {
      return NextResponse.json({ message: `Topic ${topic} ignored` }, { status: 200 });
    }

    const body = rawBody ? JSON.parse(rawBody) : {};

    console.log("Shopify webhook received", {
      topic,
      id: body?.id,
      handle: body?.handle,
      timestamp: new Date().toISOString(),
    });

    revalidateTag("shopify-products");
    revalidatePath("/shop");

    if (body?.handle) {
      revalidatePath(`/shop/${body.handle}`);
    }

    return NextResponse.json({ revalidated: true, topic });
  } catch (error) {
    console.error("Error handling Shopify webhook:", error);
    return NextResponse.json({ message: "Webhook processing failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Shopify webhook endpoint ready" });
}

