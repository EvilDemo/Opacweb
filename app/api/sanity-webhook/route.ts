import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

const isDevelopment = process.env.NODE_ENV !== "production";

function debugLog(message: string, metadata?: Record<string, unknown>) {
  if (isDevelopment) {
    console.debug(message, metadata ?? {});
  }
}

function isWebhookPayload(value: unknown): value is { _type?: string; _id?: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    (!("_type" in value) || typeof value._type === "string") &&
    (!("_id" in value) || typeof value._id === "string")
  );
}

// Test endpoint to verify webhook is reachable
export async function GET() {
  return NextResponse.json({
    message: "Sanity webhook endpoint is working",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.SANITY_WEBHOOK_SECRET?.trim();
    if (!secret) {
      console.error("Sanity webhook signing secret is not configured");
      return NextResponse.json({ message: "Error processing webhook" }, { status: 500 });
    }

    const signature = request.headers.get(SIGNATURE_HEADER_NAME);

    if (!signature) {
      console.warn("Sanity webhook rejected: missing signature");
      return NextResponse.json({ message: "Missing webhook signature" }, { status: 401 });
    }

    // Authenticate the original body before parsing or normalizing any bytes.
    const rawBody = await request.text();
    if ((await isValidSignature(rawBody, signature, secret)) !== true) {
      return NextResponse.json({ message: "Invalid webhook signature" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ message: "Malformed JSON payload" }, { status: 400 });
    }

    if (!isWebhookPayload(body)) {
      return NextResponse.json({ message: "Invalid webhook payload" }, { status: 400 });
    }

    // Get the document type from the webhook payload
    const { _type, _id } = body;
    debugLog("Sanity webhook received", { documentType: _type, documentId: _id });

    // Handle delete operations (no _type field)
    if (!_type && _id) {
      // Revalidate all content types for delete operations
      const allTags = ["pictures", "videos", "music", "radio"];
      allTags.forEach((tag) => {
        revalidateTag(tag, { expire: 0 });
      });

      return NextResponse.json({
        revalidated: true,
        now: Date.now(),
        tags: allTags,
        operation: "delete",
        documentId: _id,
      });
    }

    if (!_type) {
      return NextResponse.json({ message: "Missing document type" }, { status: 400 });
    }

    // Map document types to cache tags
    const tagMap: Record<string, string> = {
      pictures: "pictures",
      video: "videos",
      music: "music",
      radio: "radio",
    };

    const tag = Object.hasOwn(tagMap, _type) ? tagMap[_type] : undefined;

    if (tag) {
      // Revalidate the specific tag
      revalidateTag(tag, { expire: 0 });
      debugLog("Sanity tag revalidated", { tag, documentType: _type, documentId: _id });

      return NextResponse.json({
        revalidated: true,
        now: Date.now(),
        tag,
        documentType: _type,
        documentId: _id,
      });
    }

    return NextResponse.json({
      message: "No revalidation needed for this document type",
      documentType: _type,
    });
  } catch {
    console.error("Error processing Sanity webhook");
    return NextResponse.json({ message: "Error processing webhook" }, { status: 500 });
  }
}
