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

function isSignatureValid(rawBody: string, signature: string): boolean {
  if (!SHOPIFY_WEBHOOK_SECRET) {
    console.warn("⚠️ SHOPIFY_WEBHOOK_SECRET is not configured. Skipping signature verification.");
    return true;
  }

  try {
    // Shopify sends the signature as base64-encoded HMAC-SHA256
    const computedHash = crypto.createHmac("sha256", SHOPIFY_WEBHOOK_SECRET).update(rawBody, "utf8").digest("base64");

    // Use timing-safe comparison
    const computedBuffer = Buffer.from(computedHash, "base64");
    const signatureBuffer = Buffer.from(signature, "base64");

    if (computedBuffer.length !== signatureBuffer.length) {
      console.error("❌ Signature length mismatch", {
        computedLength: computedBuffer.length,
        signatureLength: signatureBuffer.length,
        computed: computedHash.substring(0, 20) + "...",
        received: signature.substring(0, 20) + "...",
      });
      return false;
    }

    const isValid = crypto.timingSafeEqual(computedBuffer, signatureBuffer);

    if (!isValid) {
      console.error("❌ Signature mismatch", {
        computed: computedHash.substring(0, 20) + "...",
        received: signature.substring(0, 20) + "...",
      });
    }

    return isValid;
  } catch (error) {
    console.error("❌ Error validating signature:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let rawBody = "";

  try {
    // Log all incoming headers for debugging
    const headers = Object.fromEntries(request.headers.entries());
    console.log("📥 Webhook request received", {
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });

    rawBody = await request.text();
    const signature = request.headers.get("x-shopify-hmac-sha256");
    const topic = request.headers.get("x-shopify-topic");
    const shop = request.headers.get("x-shopify-shop-domain");

    console.log("📋 Webhook details", {
      topic,
      shop,
      hasSignature: !!signature,
      hasSecret: !!SHOPIFY_WEBHOOK_SECRET,
      bodyLength: rawBody.length,
    });

    // Check if secret is configured
    if (!SHOPIFY_WEBHOOK_SECRET) {
      console.error("❌ SHOPIFY_WEBHOOK_SECRET environment variable is not set!");
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
      console.error("❌ Missing x-shopify-hmac-sha256 header");
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
      console.error("❌ Invalid webhook signature", {
        topic,
        shop,
        bodyPreview: rawBody.substring(0, 100) + "...",
      });
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Shopify signature",
        },
        { status: 401 }
      );
    }

    console.log("✅ Signature validated successfully");

    // Check if topic is allowed
    if (topic && !SHOPIFY_WEBHOOK_ALLOWED_TOPICS.has(topic)) {
      console.log(`ℹ️ Topic ${topic} not in allowed list, ignoring`);
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

    console.log("📦 Webhook payload", {
      topic,
      id: body?.id,
      handle: body?.handle,
      title: body?.title,
      productId: body?.product_id,
      variantId: body?.variant_id,
    });

    // Revalidate cache
    console.log("🔄 Revalidating cache...");
    revalidateTag("shopify-products");
    revalidatePath("/shop");

    if (body?.handle) {
      revalidatePath(`/shop/${body.handle}`);
      console.log(`✅ Revalidated product page: /shop/${body.handle}`);
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ Webhook processed successfully in ${processingTime}ms`, {
      topic,
      revalidated: true,
    });

    return NextResponse.json({
      success: true,
      revalidated: true,
      topic,
      processingTime: `${processingTime}ms`,
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error("❌ Error handling Shopify webhook:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      bodyLength: rawBody.length,
      processingTime: `${processingTime}ms`,
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
