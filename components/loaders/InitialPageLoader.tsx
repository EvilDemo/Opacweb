"use client";

import { useEffect, useState, memo } from "react";

interface InitialPageLoaderProps {
  minimumLoadTime: number;
  onComplete: () => void;
}

const sphereVideo = "/esfera3D_optimized.webm";

function InitialPageLoader({ minimumLoadTime, onComplete }: InitialPageLoaderProps) {
  const [counter, setCounter] = useState(1);

  useEffect(() => {
    // Smooth counter animation with easing for initial load
    const startTime = Date.now();
    const counterInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / minimumLoadTime, 0.99);

      // Easing function for smoother progression (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const counterValue = Math.floor(easedProgress * 100) + 1;

      if (counterValue <= 99) {
        setCounter(counterValue);
      }
    }, 50);

    // Complete the loader after minimum time
    const completionTimer = setTimeout(() => {
      clearInterval(counterInterval);

      // Go directly from 99 to 000, then hide
      setCounter(0);
      setTimeout(() => {
        onComplete();
      }, 200);
    }, minimumLoadTime);

    return () => {
      clearInterval(counterInterval);
      clearTimeout(completionTimer);
    };
  }, [minimumLoadTime, onComplete]);

  return (
    <div className="fixed flex flex-col lg:flex-row padding-global inset-0 z-[100] bg-black">
      {/* Video - takes remaining space and centers content */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div className="relative w-96 h-96 lg:w-[32rem] lg:h-[32rem] xl:w-[40rem] xl:h-[40rem] overflow-hidden rounded-full">
          <video src={sphereVideo} autoPlay loop muted playsInline preload="none" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Text and Counter - full width on mobile, 50/50 split on desktop */}
      <div className="flex-0 w-full lg:flex-1 flex items-end justify-end p-8 lg:p-16">
        <div className="text-right">
          {/* Brand Text */}
          <h1 className="heading-1 text-white tracking-wider mb-2">opac</h1>

          {/* Counter */}
          <div className="text-6xl lg:text-8xl font-bold text-white tracking-tight">
            <div key={counter} className="counter-simple">
              {counter === 0 ? "000" : counter.toString().padStart(3, "0")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(InitialPageLoader);
