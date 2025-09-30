import type { Metadata } from "next";
import { getRadio } from "@/lib/mediaData";
import { RadioPageContent } from "@/components/RadioPageContent";

// ISR with webhook revalidation - content updates instantly via webhook

export const metadata: Metadata = {
  title: "Opac Radio | Curated Playlists & Shows",
  description:
    "Discover Opac Radio - our curated playlists and radio shows. Experience our musical curation and discover new sounds that resonate with our artistic vision.",
  keywords: [
    "opac radio",
    "radio shows",
    "playlists",
    "curated music",
    "music curation",
    "spotify playlists",
    "radio",
    "music discovery",
    "portugal radio",
  ],
  authors: [{ name: "Opac" }],
  creator: "Opac",
  publisher: "Opac",
  openGraph: {
    title: "Opac Radio | Curated Playlists & Shows",
    description:
      "Discover Opac Radio - our curated playlists and radio shows. Experience our musical curation.",
    url: "https://weareopac.com/radio",
    siteName: "Opac",
    images: [
      {
        url: "/og-radio.jpg",
        width: 1200,
        height: 630,
        alt: "Opac Radio - Curated Playlists & Shows",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Opac Radio | Curated Playlists & Shows",
    description: "Discover Opac Radio - our curated playlists and radio shows.",
    images: ["/twitter-radio.jpg"],
  },
  alternates: {
    canonical: "https://weareopac.com/radio",
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

export default async function RadioPage() {
  // Fetch data on the server for faster initial load
  const radioData = await getRadio();

  return <RadioPageContent initialData={radioData} />;
}
