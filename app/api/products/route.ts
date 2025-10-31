import { NextRequest, NextResponse } from "next/server";
import { getProducts, getProductByHandle } from "@/lib/shopify";

// GET - Fetch products or single product by handle
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get("handle");
    const first = parseInt(searchParams.get("first") || "20");
    const after = searchParams.get("after") || undefined;

    if (handle) {
      // Get single product by handle
      const product = await getProductByHandle(handle);

      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      return NextResponse.json({ product });
    }

    // Get products list
    const result = await getProducts(first, after);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch products" },
      { status: 500 }
    );
  }
}

