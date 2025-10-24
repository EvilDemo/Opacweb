import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import ServicesSection from "@/components/ServicesSection";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Services | What We Offer at Opac",
  description:
    "Explore Opac's creative services: Musical Production, Merchandise Design, Branding, and Photography & Art Direction. From sound design to visual storytelling, we bring your artistic vision to life.",
  keywords: [
    "opac services",
    "music production",
    "sound design",
    "merchandise design",
    "branding services",
    "photography",
    "art direction",
    "creative agency",
    "audio mixing",
    "visual identity",
    "portugal creative services",
  ],
  authors: [{ name: "Opac" }],
  creator: "Opac",
  publisher: "Opac",
  openGraph: {
    title: "Services | What We Offer at Opac",
    description:
      "From music production to visual storytelling - discover Opac's full range of creative services including sound design, merchandise, branding, and art direction.",
    url: "https://opacweb.pt/about/you",
    siteName: "Opac",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Opac Services - Creative Production & Design",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Services | What We Offer at Opac",
    description: "Musical Production • Merchandise Design • Branding • Photography & Art Direction",
    images: ["/logo.webp"],
  },
  alternates: {
    canonical: "https://opacweb.pt/about/you",
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

const ServicesPage = () => {
  return (
    <>
      <ServicesSection />
      <section className="flex items-center justify-center bg-black text-white padding-global py-16">
        <div className="padding-global flex flex-col items-center justify-center gap-4">
          <h3 className="heading-3">Want to know more?</h3>
          <Link href="/contact">
            <Button>Contact Us</Button>
          </Link>
        </div>
      </section>
    </>
  );
};

export default ServicesPage;
