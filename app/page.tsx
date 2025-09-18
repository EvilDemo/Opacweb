import HeroSection from "@/components/HeroSection";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Opac - Embracing Individuality Through Music & Fashion",
  description:
    "Opac creates residue through music and clothing - a trace of something unspoken. Discover our unique approach to artistic expression and individuality.",
  keywords: [
    "opac",
    "music",
    "fashion",
    "artistic expression",
    "individuality",
    "clothing",
    "creative collective",
    "portugal",
  ],
  authors: [{ name: "Opac" }],
  creator: "Opac",
  publisher: "Opac",
  openGraph: {
    title: "Opac - Embracing Individuality Through Music & Fashion",
    description:
      "Opac creates residue through music and clothing - a trace of something unspoken. Discover our unique approach to artistic expression and individuality.",
    url: "https://weareopac.com",
    siteName: "Opac",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Opac - Music and Fashion Collective",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Opac - Embracing Individuality Through Music & Fashion",
    description:
      "Opac creates residue through music and clothing - a trace of something unspoken.",
    images: ["/twitter-image.jpg"],
  },
  alternates: {
    canonical: "https://weareopac.com",
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

export default function Home() {
  return (
    <div className="flex flex-col row-start-2 justify-around sm:items-start">
      <HeroSection />
    </div>
  );
}
