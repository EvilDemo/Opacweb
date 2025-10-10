"use client";

import { memo, useEffect, useState } from "react";

const sphereVideo = "/esfera3D_optimized.webm";

interface SimplePageLoaderProps {
  isExiting?: boolean;
}

function SimplePageLoader({ isExiting = false }: SimplePageLoaderProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in after mount
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity ${
        isVisible && !isExiting ? "opacity-100 duration-300" : "opacity-0 delay-[700ms] duration-300"
      }`}
    >
      <div
        className={`relative w-32 h-32 overflow-hidden rounded-full transition-all ${
          isVisible && !isExiting ? "opacity-100 scale-100 delay-200 duration-400" : "opacity-0 scale-80 duration-400"
        }`}
      >
        <video src={sphereVideo} autoPlay loop muted playsInline className="w-full h-full object-contain" />
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(SimplePageLoader);
