"use client";

import { useEffect, useState } from "react";

interface PageLoaderProps {
  children: React.ReactNode;
  showOnFirstVisitOnly?: boolean;
  minimumLoadTime?: number; // in milliseconds
}

export default function PageLoader({
  children,
  showOnFirstVisitOnly = true,
  minimumLoadTime = 2000,
}: PageLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasVisited, setHasVisited] = useState(false);

  useEffect(() => {
    // Check if user has visited before (only if showOnFirstVisitOnly is true)
    if (showOnFirstVisitOnly) {
      const visited = localStorage.getItem("opac-has-visited");
      setHasVisited(!!visited);

      if (!visited) {
        // Mark as visited
        localStorage.setItem("opac-has-visited", "true");
      }
    }

    // Set minimum loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, minimumLoadTime);

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, [showOnFirstVisitOnly, minimumLoadTime]);

  // Don't show loader if user has visited before and showOnFirstVisitOnly is true
  if (showOnFirstVisitOnly && hasVisited) {
    return <>{children}</>;
  }

  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="flex flex-col items-center space-y-8">
        {/* Logo/Brand */}
        <div className="relative">
          <div className="w-16 h-16 border-2 border-white rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-full h-full border-2 border-transparent border-t-white rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h1 className="heading-3 text-white">OPAC</h1>
          <p className="body-text-sm text-muted">Loading...</p>
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1 bg-neutral-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full"
            style={{
              animation: "loading 2s ease-in-out infinite",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
