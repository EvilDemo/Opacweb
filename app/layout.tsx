import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

//Importing Components
import Footer from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import Staging from "@/components/Staging";
import RouteLoader from "@/components/RouteLoader";

//Importing Font
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "900"], // Only load weights used in Figma design
});

export const metadata: Metadata = {
  title: {
    default: "Opac - Embracing Individuality Through Music & Fashion",
    template: "%s | Opac",
  },
  description:
    "Opac creates residue through music and clothing - a trace of something unspoken. We are not here to fill silence. We are here to bend it.",
  keywords: [
    "opac",
    "music",
    "fashion",
    "artistic expression",
    "individuality",
    "clothing",
    "creative collective",
    "portugal",
    "music collective",
  ],
  authors: [{ name: "Opac" }],
  creator: "Opac",
  publisher: "Opac",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://weareopac.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://weareopac.com",
    siteName: "Opac",
    title: "Opac - Embracing Individuality Through Music & Fashion",
    description:
      "Opac creates residue through music and clothing - a trace of something unspoken.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Opac - Music and Fashion Collective",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Opac - Embracing Individuality Through Music & Fashion",
    description:
      "Opac creates residue through music and clothing - a trace of something unspoken.",
    images: ["/twitter-image.jpg"],
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
  verification: {
    // Add when you have these verification codes
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://h2v639gy.api.sanity.io" />
        <link rel="preconnect" href="https://va.vercel-scripts.com" />
        <link rel="preconnect" href="https://cdn.sanity.io" />
      </head>
      <SpeedInsights />
      <body className={`${geist.variable} antialiased`}>
        <RouteLoader minimumLoadTime={1000}>
          {/* <Staging /> */}
          <Navbar />
          <main>{children}</main>
          <Footer />
        </RouteLoader>
      </body>
    </html>
  );
}
