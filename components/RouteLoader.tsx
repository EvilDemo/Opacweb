"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import InitialPageLoader from "./loaders/InitialPageLoader";
import SimplePageLoader from "./loaders/SimplePageLoader";
import { useLoader } from "./loaders/LoaderContext";

interface RouteLoaderProps {
  children: React.ReactNode;
  minimumLoadTime?: number;
}

export default function RouteLoader({ children, minimumLoadTime = 3000 }: RouteLoaderProps) {
  const { showInitialLoader, setShowInitialLoader } = useLoader();
  const [isLoaderExiting, setIsLoaderExiting] = useState(false);
  const [hasCompletedInitialRender, setHasCompletedInitialRender] = useState(false);
  const [blockPageMount, setBlockPageMount] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Set initial render flag based on loader state
  useEffect(() => {
    if (!showInitialLoader) {
      setHasCompletedInitialRender(true);
    }
  }, [showInitialLoader]);

  // Callback for when initial loader completes
  const handleInitialLoaderComplete = useCallback(() => {
    setShowInitialLoader(false);
    setHasCompletedInitialRender(true);
  }, [setShowInitialLoader]);

  // Handle programmatic navigation requests
  useEffect(() => {
    const handleNavigationRequest = (event: CustomEvent<{ href: string }>) => {
      const { href } = event.detail;

      // Skip loader when navigating within the studio
      if (href.startsWith("/studio")) {
        router.push(href);
        return;
      }

      // Block page mount and show simple loader for navigation
      setBlockPageMount(true);
      setIsLoaderExiting(false);
      const loadTime = 1500;

      // Wait a brief moment for loader to be visible before navigating
      const navigationTimer = setTimeout(() => {
        // Small delay to ensure loader is fully rendered
        requestAnimationFrame(() => {
          router.push(href);
          // Keep loader visible for a moment after navigation
          setTimeout(() => {
            setIsLoaderExiting(true);
            setTimeout(() => {
              setIsLoaderExiting(false);
              setBlockPageMount(false);
            }, 600);
          }, 100);
        });
      }, loadTime);

      return () => clearTimeout(navigationTimer);
    };

    window.addEventListener("requestNavigation", handleNavigationRequest as EventListener);
    return () => window.removeEventListener("requestNavigation", handleNavigationRequest as EventListener);
  }, [router]);

  // Handle Next.js Link clicks with loader
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("/studio")) {
        return;
      }

      // Only intercept internal links that navigate to different pages
      if (href === pathname) return;

      e.preventDefault();

      // Block page mount and show simple loader for navigation
      setBlockPageMount(true);
      setIsLoaderExiting(false);
      const loadTime = 1500;

      setTimeout(() => {
        // Small delay to ensure loader is fully rendered
        requestAnimationFrame(() => {
          router.push(href);
          // Keep loader visible for a moment after navigation
          setTimeout(() => {
            setIsLoaderExiting(true);
            setTimeout(() => {
              setIsLoaderExiting(false);
              setBlockPageMount(false);
            }, 600);
          }, 100);
        });
      }, loadTime);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [router, pathname]);

  // Handle route changes (browser navigation)
  // Note: For browser back/forward navigation, the route has already changed by the time
  // we detect it, so showing a loader would cause a flash. We only show loaders for
  // programmatic navigation where we control the timing.
  useEffect(() => {
    // Set the flag on first render
    if (!hasCompletedInitialRender) {
      setHasCompletedInitialRender(true);
    }
  }, [pathname, hasCompletedInitialRender]);

  // Show initial page loader on first visit (replaces everything including navbar)
  if (showInitialLoader) {
    return <InitialPageLoader minimumLoadTime={minimumLoadTime} onComplete={handleInitialLoaderComplete} />;
  }

  // Show loader while blocked (replaces everything, page won't mount)
  if (blockPageMount) {
    return <SimplePageLoader isExiting={isLoaderExiting} />;
  }

  // Render page with pathname key to retrigger animations on route change
  return <div key={pathname}>{children}</div>;
}
