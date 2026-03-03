import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;
const isDevelopment = process.env.NODE_ENV !== "production";
const SHOPIFY_WEBHOOK_ALLOWED_TOPICS = new Set([
  "products/create",
  "products/update",
  "products/delete",
  "inventory_levels/update",
]);

function debugLog(message: string, metadata?: Record<string, unknown>) {
  if (isDevelopment) {
    console.debug(message, metadata ?? {});
  }
}

function isSignatureValid(rawBody: string, signature: string): boolean {
  if (!SHOPIFY_WEBHOOK_SECRET) {
    console.warn("Shopify webhook secret not configured; skipping signature validation");
    return true;
  }

  try {
    // Shopify sends the signature as base64-encoded HMAC-SHA256
    const computedHash = crypto.createHmac("sha256", SHOPIFY_WEBHOOK_SECRET).update(rawBody, "utf8").digest("base64");

    // Use timing-safe comparison
    const computedBuffer = Buffer.from(computedHash, "base64");
    const signatureBuffer = Buffer.from(signature, "base64");

    if (computedBuffer.length !== signatureBuffer.length) {
      debugLog("Shopify signature length mismatch", {
        computedLength: computedBuffer.length,
        signatureLength: signatureBuffer.length,
      });
      return false;
    }

    const isValid = crypto.timingSafeEqual(computedBuffer, signatureBuffer);

    if (!isValid) {
      debugLog("Shopify signature mismatch");
    }

    return isValid;
  } catch (error) {
    console.error("Error validating Shopify webhook signature:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let rawBody = "";

  try {
    rawBody = await request.text();
    const signature = request.headers.get("x-shopify-hmac-sha256");
    const topic = request.headers.get("x-shopify-topic");
    const shop = request.headers.get("x-shopify-shop-domain");

    debugLog("Shopify webhook received", { topic, shop });

    // Check if secret is configured
    if (!SHOPIFY_WEBHOOK_SECRET) {
      console.error("Shopify webhook secret is not configured");
      return NextResponse.json(
        {
          success: false,
          message: "Webhook secret not configured on server",
          configRequired: true,
        },
        { status: 500 }
      );
    }

    // Check for signature header
    if (!signature) {
      console.warn("Shopify webhook rejected: missing signature header");
      return NextResponse.json(
        {
          success: false,
          message: "Missing Shopify signature header",
        },
        { status: 401 }
      );
    }

    // Validate signature
    if (!isSignatureValid(rawBody, signature)) {
      console.warn("Shopify webhook rejected: invalid signature", { topic, shop });
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Shopify signature",
        },
        { status: 401 }
      );
    }

    // Check if topic is allowed
    if (topic && !SHOPIFY_WEBHOOK_ALLOWED_TOPICS.has(topic)) {
      debugLog("Shopify webhook ignored: topic not allowed", { topic });
      return NextResponse.json(
        {
          success: true,
          message: `Topic ${topic} ignored`,
          ignored: true,
        },
        { status: 200 }
      );
    }

    // Parse webhook body
    const body = rawBody ? JSON.parse(rawBody) : {};

    // Revalidate cache
    revalidateTag("shopify-products", "page");
    revalidatePath("/shop");

    if (body?.handle) {
      revalidatePath(`/shop/${body.handle}`);
    }

    const processingTime = Date.now() - startTime;
    debugLog("Shopify webhook processed", { topic, processingTimeMs: processingTime });

    return NextResponse.json({
      success: true,
      revalidated: true,
      topic,
      processingTime: `${processingTime}ms`,
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error("Error handling Shopify webhook:", {
      error: error instanceof Error ? error.message : String(error),
      bodyLength: rawBody.length,
      processingTimeMs: processingTime,
    });

    return NextResponse.json(
      {
        success: false,
        message: "Webhook processing failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const hasSecret = !!SHOPIFY_WEBHOOK_SECRET;

  return NextResponse.json({
    status: "ok",
    message: "Shopify webhook endpoint ready",
    configured: hasSecret,
    allowedTopics: Array.from(SHOPIFY_WEBHOOK_ALLOWED_TOPICS),
    timestamp: new Date().toISOString(),
    warning: hasSecret ? undefined : "SHOPIFY_WEBHOOK_SECRET not configured",
  });
}
