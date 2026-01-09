import { Metadata } from "next";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { getProducts, isShopifyConfigured } from "@/lib/shopify";
import type { Product } from "@/types/commerce";

export const metadata: Metadata = {
  title: "Shop | Opac - Merchandise & Music",
  description:
    "Discover and purchase Opac merchandise, music, and exclusive releases. Shop our curated collection of clothing, accessories, and digital content.",
  keywords: [
    "opac shop",
    "merchandise",
    "music",
    "clothing",
    "accessories",
    "digital content",
    "exclusive releases",
    "portugal shop",
    "creative merchandise",
  ],
  authors: [{ name: "Opac" }],
  creator: "Opac",
  publisher: "Opac",
  openGraph: {
    title: "Shop | Opac - Merchandise & Music",
    description: "Discover and purchase Opac merchandise, music, and exclusive releases. Shop our curated collection.",
    url: "https://opacweb.pt/shop",
    siteName: "Opac",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Opac Shop - Merchandise & Music",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop | Opac - Merchandise & Music",
    description: "Discover and purchase Opac merchandise and exclusive releases.",
    images: ["/logo.webp"],
  },
  alternates: {
    canonical: "https://opacweb.pt/shop",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function ShopPage() {
  let products: Product[] = [];
  let error: string | null = null;
  const shopifyConfigured = isShopifyConfigured();

  if (!shopifyConfigured) {
    error = "Shopify is not configured. Please add your Shopify credentials to .env.local";
  } else {
    try {
      const result = await getProducts(20);
      products = result.products;
    } catch (err) {
      console.error("Error fetching products:", err);
      error = err instanceof Error ? err.message : "Failed to load products";
    }
  }

  return (
    <section className="flex flex-col bg-black text-white min-h-[calc(100vh-6rem)] py-16 align-center justify-center">
      {error ? (
        <div className="padding-global">
          <div className="bg-neutral-900 rounded-lg p-12 border border-neutral-800 text-center max-w-2xl mx-auto">
            <h2 className="heading-2 mb-4">Shop Configuration Required</h2>
            <p className="body-text text-gray-400 mb-6">{error}</p>
            <div className="bg-black rounded-lg p-6 border border-neutral-800 text-left">
              <p className="body-text-sm text-white mb-4 font-semibold">Add these to your .env.local file:</p>
              <pre className="text-xs text-neutral-300 overflow-x-auto">
                {`NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-access-token
NEXT_PUBLIC_SHOP_ENABLED=true`}
              </pre>
            </div>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="padding-global">
          <div className="bg-neutral-900 rounded-lg p-12 border border-neutral-800 text-center">
            <h2 className="heading-2 mb-4">No products found</h2>
            <p className="body-text text-gray-400">Add some products to your Shopify store to see them here.</p>
          </div>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </section>
  );
}
