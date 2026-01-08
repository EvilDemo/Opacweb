"use client";

import dynamic from "next/dynamic";

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

export default function HomeInteractiveCanvasClient() {
  return <HomeInteractiveCanvas />;
}
