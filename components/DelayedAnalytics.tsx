"use client";

import { useEffect, useState, type ComponentType } from "react";

export default function DelayedAnalytics() {
  const [Analytics, setAnalytics] = useState<ComponentType | null>(null);
  const [SpeedInsights, setSpeedInsights] = useState<ComponentType | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let idleCallbackId: number | undefined;
    let timeoutId: NodeJS.Timeout | undefined;

    const loadAnalytics = async () => {
      // Dynamically import the analytics components only when needed
      const [analyticsModule, speedInsightsModule] = await Promise.all([
        import("@vercel/analytics/react"),
        import("@vercel/speed-insights/next"),
      ]);

      setAnalytics(() => analyticsModule.Analytics);
      setSpeedInsights(() => speedInsightsModule.SpeedInsights);

      // Clean up listeners and callbacks
      if (cleanup) cleanup();
      if (idleCallbackId !== undefined && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleCallbackId);
      }
      if (timeoutId) clearTimeout(timeoutId);
    };

    // Strategy 1: Load after first user interaction
    const interactionEvents = ["click", "scroll", "touchstart", "keydown"] as const;
    const handleInteraction = () => {
      loadAnalytics();
    };

    interactionEvents.forEach((event) => {
      document.addEventListener(event, handleInteraction, { once: true, passive: true });
    });

    cleanup = () => {
      interactionEvents.forEach((event) => {
        document.removeEventListener(event, handleInteraction);
      });
    };

    // Strategy 2: Fallback to requestIdleCallback with 2s timeout
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleCallbackId = window.requestIdleCallback(
        () => {
          loadAnalytics();
        },
        { timeout: 2000 }
      );
    } else {
      // Strategy 3: Fallback to setTimeout for browsers without requestIdleCallback (5s)
      timeoutId = setTimeout(() => {
        loadAnalytics();
      }, 5000);
    }

    return () => {
      if (cleanup) cleanup();
      if (idleCallbackId !== undefined && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleCallbackId);
      }
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Render nothing until components are loaded
  if (!Analytics || !SpeedInsights) {
    return null;
  }

  // Render the analytics components once loaded
  return (
    <>
      <SpeedInsights />
      <Analytics />
    </>
  );
}
