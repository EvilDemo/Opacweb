import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify this is a valid Sanity webhook
    const secret = request.headers.get("sanity-webhook-secret");
    if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
      console.log("Invalid webhook secret");
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    console.log("Webhook received:", JSON.stringify(body, null, 2));
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Timestamp:", new Date().toISOString());

    // Get the document type from the webhook payload
    const { _type, _id } = body;

    // Handle delete operations (no _type field)
    if (!_type && _id) {
      console.log("Delete operation detected, revalidating all content types");

      // Revalidate all content types for delete operations
      const allTags = ["pictures", "videos", "music", "radio"];
      allTags.forEach((tag) => {
        revalidateTag(tag);
        console.log(`Revalidated tag: ${tag}`);
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
      console.log("Missing document type in webhook payload");
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
      revalidateTag(tag);
      console.log(`Revalidated tag: ${tag} for document type: ${_type}`);

      return NextResponse.json({
        revalidated: true,
        now: Date.now(),
        tag,
        documentType: _type,
        documentId: _id,
      });
    }

    console.log(`No revalidation needed for document type: ${_type}`);
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
