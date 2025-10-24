import { Metadata } from "next";

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

export default function ShopPage() {
  return (
    <section className="flex items-center justify-center bg-black text-white padding-global py-16 min-h-[calc(100vh-6rem)]">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center gap-4 h-full">
        <div className="bg-neutral-900 rounded-lg p-12 border border-neutral-800">
          <h2 className="heading-2 mb-4">Coming Soon</h2>
          <p className="body-large text-gray-400">
            Our shop is currently under development. Check back soon for exclusive OPAC merchandise and music releases.
          </p>
        </div>
      </div>
    </section>
  );
}
