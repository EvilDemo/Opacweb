"use client";

import { memo, useEffect, useState } from "react";

const sphereVideo = "/esfera3D_optimized.webm";

interface SimplePageLoaderProps {
  isExiting?: boolean;
}

function SimplePageLoader({ isExiting = false }: SimplePageLoaderProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in for sphere after a brief moment
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-opacity ${
        !isExiting ? "opacity-100" : "opacity-0 duration-500"
      }`}
    >
      <div
        className={`relative w-32 h-32 overflow-hidden rounded-full transition-all duration-500 ${
          isVisible && !isExiting ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        <video src={sphereVideo} autoPlay loop muted playsInline className="w-full h-full object-contain" />
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(SimplePageLoader);
