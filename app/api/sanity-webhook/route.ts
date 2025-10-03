import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// Test endpoint to verify webhook is reachable
export async function GET() {
  return NextResponse.json({
    message: "Sanity webhook endpoint is working",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Add comprehensive logging
    console.log("=== WEBHOOK RECEIVED ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Body:", JSON.stringify(body, null, 2));
    console.log("Headers:", Object.fromEntries(request.headers.entries()));

    // Verify this is a valid Sanity webhook
    const signature = request.headers.get("sanity-webhook-signature");

    if (!signature) {
      console.log("❌ Missing webhook signature");
      return NextResponse.json(
        { message: "Missing webhook signature" },
        { status: 401 }
      );
    }

    // Get the document type from the webhook payload
    const { _type, _id } = body;
    console.log("Document type:", _type, "Document ID:", _id);

    // Handle delete operations (no _type field)
    if (!_type && _id) {
      // Revalidate all content types for delete operations
      const allTags = ["pictures", "videos", "music", "radio"];
      allTags.forEach((tag) => {
        revalidateTag(tag);
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
      return NextResponse.json(
        { message: "Missing document type" },
        { status: 400 }
      );
    }

    // Map document types to cache tags
    const tagMap: Record<string, string> = {
      pictures: "pictures",
      video: "videos",
      music: "music",
      radio: "radio",
    };

    const tag = tagMap[_type];

    if (tag) {
      // Revalidate the specific tag
      console.log(`🔄 Revalidating tag: ${tag}`);
      revalidateTag(tag);
      console.log(`✅ Tag ${tag} revalidated successfully`);

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
  } catch (err) {
    console.error("Error in Sanity webhook:", err);
    return NextResponse.json(
      { message: "Error processing webhook" },
      { status: 500 }
    );
  }
}
