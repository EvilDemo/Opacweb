import type { Metadata } from "next";
import { MediaPageContent } from "@/components/MediaPageContent";
import { getPictures, getVideos, getMusic } from "@/lib/mediaData";

export const metadata: Metadata = {
  title: "Opac Media | Music, Videos & Pictures",
  description:
    "Explore Opac's creative output - discover our music releases, video content, and photography. Experience our artistic vision across multiple mediums.",
  keywords: [
    "opac media",
    "music",
    "videos",
    "pictures",
    "creative content",
    "multimedia",
    "artistic expression",
    "portugal music",
  ],
  authors: [{ name: "Opac" }],
  creator: "Opac",
  publisher: "Opac",
  openGraph: {
    title: "Opac Media | Music, Videos & Pictures",
    description:
      "Explore Opac's creative output across music, video, and photography. Experience our artistic vision.",
    url: "https://weareopac.com/media",
    siteName: "Opac",
    images: [
      {
        url: "/og-media.jpg",
        width: 1200,
        height: 630,
        alt: "Opac Media - Music, Videos & Pictures",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Opac Media | Music, Videos & Pictures",
    description: "Explore Opac's creative output across multiple mediums.",
    images: ["/twitter-media.jpg"],
  },
  alternates: {
    canonical: "https://weareopac.com/media",
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

export default async function MediaPage() {
  // Debug: Log environment variables
  console.log("=== SANITY DEBUG INFO ===");
  console.log("Sanity Project ID:", process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
  console.log("Sanity Dataset:", process.env.NEXT_PUBLIC_SANITY_DATASET);
  console.log(
    "Sanity API Version:",
    process.env.NEXT_PUBLIC_SANITY_API_VERSION
  );
  console.log(
    "Sanity Webhook Secret:",
    process.env.SANITY_WEBHOOK_SECRET ? "SET" : "NOT SET"
  );
  console.log("========================");

  // Fetch all media data on the server
  const [pictures, videos, music] = await Promise.all([
    getPictures(),
    getVideos(),
    getMusic(),
  ]);

  // Debug: Log data counts
  console.log("=== DATA COUNTS ===");
  console.log("Pictures count:", pictures.length);
  console.log("Videos count:", videos.length);
  console.log("Music count:", music.length);
  console.log("==================");

  return (
    <MediaPageContent
      initialData={{
        pictures,
        videos,
        music,
      }}
    />
  );
}
