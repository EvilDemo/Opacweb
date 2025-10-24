import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A0TY - Album of the Year | Opac",
  description:
    "Experience A0TY - Opac's Album of the Year. An immersive musical journey that explores the depths of artistic expression through sound and visual storytelling.",
  keywords: [
    "a0ty",
    "album of the year",
    "opac music",
    "album",
    "music release",
    "artistic expression",
    "portugal music",
    "creative music",
    "experimental music",
  ],
  authors: [{ name: "Opac" }],
  creator: "Opac",
  publisher: "Opac",
  openGraph: {
    title: "A0TY - Album of the Year | Opac",
    description:
      "Experience A0TY - Opac's Album of the Year. An immersive musical journey through artistic expression.",
    url: "https://opacweb.pt/a0ty",
    siteName: "Opac",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "A0TY - Album of the Year by Opac",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "A0TY - Album of the Year | Opac",
    description: "Experience A0TY - Opac's Album of the Year.",
    images: ["/logo.webp"],
  },
  alternates: {
    canonical: "https://opacweb.pt/a0ty",
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

export default function A0TYLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
