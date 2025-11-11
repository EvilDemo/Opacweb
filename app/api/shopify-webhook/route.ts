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

  const computedDigest = crypto.createHmac("sha256", SHOPIFY_WEBHOOK_SECRET).update(rawBody, "utf8").digest("base64");
  const computedBuffer = Buffer.from(computedDigest, "base64");
  const signatureBuffer = Buffer.from(signature, "base64");

  if (computedBuffer.length !== signatureBuffer.length) {
    console.error(
      "Shopify webhook signature length mismatch",
      JSON.stringify(
        {
          computedLength: computedBuffer.length,
          signatureLength: signatureBuffer.length,
        },
        null,
        2
      )
    );
    return false;
  }

  return crypto.timingSafeEqual(computedBuffer, signatureBuffer);
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-shopify-hmac-sha256");
    const topic = request.headers.get("x-shopify-topic");

    if (!signature) {
      console.error("Shopify webhook missing signature header.");
      return NextResponse.json({ message: "Missing Shopify signature" }, { status: 401 });
    }

    if (!isSignatureValid(rawBody, signature)) {
      console.error(
        "Invalid Shopify signature received",
        JSON.stringify(
          {
            topic,
            signatureFromHeader: signature,
            bodyPreview: rawBody.slice(0, 200),
          },
          null,
          2
        )
      );
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
