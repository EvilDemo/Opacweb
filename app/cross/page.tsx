import dynamic from "next/dynamic";
import type { Metadata } from "next";

// Loading component for Home Interactive Canvas
function CanvasLoadingState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-white"></div>
        <p className="body-text-sm text-white/80">Loading A0TY mode...</p>
      </div>
    </div>
  );
}

const HomeInteractiveCanvas = dynamic(
  () =>
    import("@/components/three/HomeInteractiveCanvas").then((mod) => ({
      default: mod.HomeInteractiveCanvas,
    })),
  {
    ssr: false,
    loading: () => <CanvasLoadingState />,
  }
);

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
      <HomeInteractiveCanvas />
    </main>
  );
}
