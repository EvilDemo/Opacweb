"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface RouteLoaderProps {
  children: React.ReactNode;
  minimumLoadTime?: number; // in milliseconds
}

// 3D Sphere video from your public folder
const sphereVideo = "/esfera3D_optimized.webm";

export default function RouteLoader({ children, minimumLoadTime = 1000 }: RouteLoaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [counter, setCounter] = useState(1);
  const pathname = usePathname();
  const router = useRouter();

  // Handle programmatic navigation requests
  useEffect(() => {
    const handleNavigationRequest = (event: CustomEvent<{ href: string }>) => {
      const { href } = event.detail;

      // Skip loader when navigating within the studio
      if (href.startsWith("/studio")) {
        router.push(href);
        return;
      }

      // Show loader
      setIsLoading(true);
      setCounter(1);

      // Smooth counter animation with easing
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

      // Navigate after animation completes
      const navigationTimer = setTimeout(() => {
        clearInterval(counterInterval);
        router.push(href);

        // Go directly from 99 to 000, then hide
        setCounter(0);
        setTimeout(() => {
          setIsLoading(false);
        }, 200);
      }, minimumLoadTime);

      // Cleanup function
      const cleanup = () => {
        if (counterInterval) {
          clearInterval(counterInterval);
        }
        if (navigationTimer) {
          clearTimeout(navigationTimer);
        }
      };

      // Store cleanup in a way that can be accessed if component unmounts
      return cleanup;
    };

    window.addEventListener("requestNavigation", handleNavigationRequest as EventListener);

    return () => {
      window.removeEventListener("requestNavigation", handleNavigationRequest as EventListener);
    };
  }, [router, minimumLoadTime]);

  useEffect(() => {
    // Skip loader on very first page load
    if (isFirstLoad) {
      setIsFirstLoad(false);
      return;
    }

    // Skip loader when navigating within the studio
    if (pathname.startsWith("/studio")) {
      return;
    }

    // Show loader on route changes (for direct navigation via browser)
    setIsLoading(true);
    setCounter(1);

    // Smooth counter animation with easing
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
    }, 50); // Slightly slower updates for more visible animation

    // Complete the loader after minimum time
    const completionTimer = setTimeout(() => {
      clearInterval(counterInterval);

      // Go directly from 99 to 000, then hide
      setCounter(0);
      setTimeout(() => {
        setIsLoading(false);
      }, 200);
    }, minimumLoadTime);

    return () => {
      if (counterInterval) {
        clearInterval(counterInterval);
      }
      if (completionTimer) {
        clearTimeout(completionTimer);
      }
    };
  }, [pathname, minimumLoadTime, isFirstLoad]);

  if (isLoading) {
    return (
      <div className="fixed flex flex-col lg:flex-row padding-global inset-0 z-50 bg-black">
        {/* Video - takes remaining space and centers content */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <div className="relative w-96 h-96 lg:w-[32rem] lg:h-[32rem] xl:w-[40rem] xl:h-[40rem] overflow-hidden rounded-full">
            <video src={sphereVideo} autoPlay loop muted playsInline className="w-full h-full object-contain" />
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
                {counter === 0 ? "000" : counter.toString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
