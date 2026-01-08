"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to detect media query matches
 * SSR-safe: Returns undefined on server, actual value on client after hydration
 * @param query - CSS media query string (e.g., '(max-width: 767px)')
 * @returns boolean indicating if the media query matches, or undefined during SSR
 */
export function useMediaQuery(query: string): boolean {
  // Start with undefined during SSR to avoid hydration mismatch
  // Will be set to actual value in useEffect after mount
  const [matches, setMatches] = useState<boolean | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);

    // Listen for changes
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    media.addEventListener("change", listener);
    
    return () => {
      media.removeEventListener("change", listener);
    };
  }, [query]);

  // Return false during SSR/initial render to provide a consistent default
  // This prevents hydration mismatches
  return mounted ? (matches ?? false) : false;
}
