import { NextRequest, NextResponse } from "next/server";
import { getProducts, isShopifyConfigured } from "@/lib/shopify";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Validate and clamp 'first' parameter to prevent DoS
  // Default: 20, Min: 1, Max: 100 (prevents resource exhaustion)
  const rawFirst = searchParams.get("first") || "20";
  const parsedFirst = parseInt(rawFirst, 10);
  const first = Number.isNaN(parsedFirst) 
    ? 20 
    : Math.min(Math.max(parsedFirst, 1), 100);

  // Validate cursor format (base64-like string)
  // Only allow alphanumeric characters, +, /, and = for padding
  const rawAfter = searchParams.get("after");
  const after = rawAfter && /^[a-zA-Z0-9+/=]+$/.test(rawAfter) 
    ? rawAfter 
    : undefined;

  if (!isShopifyConfigured()) {
    return NextResponse.json(
      { error: "Shopify is not configured" },
      { status: 500 }
    );
  }

  try {
    // Add timeout to prevent hanging requests (5 seconds)
    let timeoutId: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Request timeout")), 5000);
    });

    const productsPromise = getProducts(first, after).finally(() => {
      // Clear timeout if request completes successfully
      if (timeoutId) clearTimeout(timeoutId);
    });

    const result = await Promise.race([
      productsPromise,
      timeoutPromise,
    ]) as Awaited<ReturnType<typeof getProducts>>;

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching products:", error);
    
    // Don't expose internal error details to clients
    const errorMessage = error instanceof Error && error.message === "Request timeout"
      ? "Request timeout"
      : "Failed to fetch products";

    return NextResponse.json(
      { error: errorMessage },
      { status: error instanceof Error && error.message === "Request timeout" ? 408 : 500 }
    );
  }
}
