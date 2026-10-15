"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import InitialPageLoader from "./loaders/InitialPageLoader";
import { useLoader } from "./loaders/LoaderContext";

export default function RouteLoader({ children, minimumLoadTime = 450 }: {
  children: React.ReactNode;
  minimumLoadTime?: number;
}) {
  const { showInitialLoader, setShowInitialLoader } = useLoader();
  const router = useRouter();
  const complete = useCallback(() => setShowInitialLoader(false), [setShowInitialLoader]);

  useEffect(() => {
    const navigate = (event: Event) => {
      router.push((event as CustomEvent<{ href: string }>).detail.href);
    };
    window.addEventListener("requestNavigation", navigate);
    return () => window.removeEventListener("requestNavigation", navigate);
  }, [router]);

  return (
    <>
      {children}
      {showInitialLoader && <InitialPageLoader minimumLoadTime={minimumLoadTime} onComplete={complete} />}
    </>
  );
}
