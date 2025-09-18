import type { Metadata } from "next";
import { MediaPageContent } from "@/components/MediaPageContent";

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

export default function MediaPage() {
  return <MediaPageContent />;
}
