import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  // Check for secret to confirm this is a valid request
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { tag } = body;

    if (!tag) {
      return NextResponse.json(
        { message: "Missing tag param" },
        { status: 400 }
      );
    }

    // Revalidate the specific tag
    revalidateTag(tag);

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      tag,
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Error revalidating" },
      { status: 500 }
    );
  }
}
