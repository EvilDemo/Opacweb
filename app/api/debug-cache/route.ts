import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const tag = searchParams.get("tag") || "all";

    // Verify secret
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    const tags =
      tag === "all" ? ["pictures", "videos", "music", "radio"] : [tag];

    // Revalidate all specified tags
    tags.forEach((t) => {
      revalidateTag(t);
      console.log(`Revalidated tag: ${t}`);
    });

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      tags,
      environment: process.env.NODE_ENV,
    });
  } catch (err) {
    console.error("Error in debug cache:", err);
    return NextResponse.json(
      { message: "Error processing cache revalidation" },
      { status: 500 }
    );
  }
}
