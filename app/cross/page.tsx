import type { Metadata } from "next";
import HomeInteractiveCanvasClient from "@/components/three/HomeInteractiveCanvasClient";

export const metadata: Metadata = {
  title: "Cross | Opac - Interactive Experience",
  description:
    "Experience the Cross - an interactive 3D journey into Opac's artistic vision. Explore the intersection of music, fashion, and digital art through immersive technology.",
  keywords: [
    "cross",
    "interactive experience",
    "3d art",
    "opac",
    "digital art",
    "immersive",
    "creative technology",
    "artistic expression",
    "portugal art",
  ],
  authors: [{ name: "Opac" }],
  creator: "Opac",
  publisher: "Opac",
  openGraph: {
    title: "Cross | Opac - Interactive Experience",
    description:
      "Experience the Cross - an interactive 3D journey into Opac's artistic vision through immersive technology.",
    url: "https://opacweb.pt/cross",
    siteName: "Opac",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Cross - Opac Interactive Experience",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cross | Opac - Interactive Experience",
    description: "Experience the Cross - an interactive 3D journey into Opac's artistic vision.",
    images: ["/logo.webp"],
  },
  alternates: {
    canonical: "https://opacweb.pt/cross",
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

export default function CrossPage() {
  return (
    <main className="w-full h-screen overflow-hidden">
      <HomeInteractiveCanvasClient />
    </main>
  );
}
