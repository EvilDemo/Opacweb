import React from "react";
import type { Metadata } from "next";
import { AboutHeroSection } from "@/components/AboutHeroSection";
import { AboutManifestoSection } from "@/components/AboutManifestoSection";
import { PrinciplesSection } from "@/components/AboutPrinciplesSection";

export const metadata: Metadata = {
  title: "About Opac | Embracing the Difference",
  description:
    "We are not here to fill silence. We are here to bend it. Learn about Opac's mission to create residue through music and clothing - a trace of something unspoken.",
  keywords: [
    "opac about",
    "music collective",
    "fashion brand",
    "artistic philosophy",
    "individuality",
    "creative mission",
    "portugal collective",
  ],
  authors: [{ name: "Opac" }],
  creator: "Opac",
  publisher: "Opac",
  openGraph: {
    title: "About Opac | Embracing the Difference",
    description:
      "We are not here to fill silence. We are here to bend it. Discover Opac's philosophy and approach to music and fashion.",
    url: "https://weareopac.com/about",
    siteName: "Opac",
    images: [
      {
        url: "/og-about.jpg",
        width: 1200,
        height: 630,
        alt: "About Opac - Our Philosophy and Mission",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Opac | Embracing the Difference",
    description: "We are not here to fill silence. We are here to bend it.",
    images: ["/twitter-about.jpg"],
  },
  alternates: {
    canonical: "https://weareopac.com/about",
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

const AboutPage = () => {
  return (
    <>
      <AboutHeroSection />
      <AboutManifestoSection />
      <PrinciplesSection />
    </>
  );
};

export default AboutPage;
