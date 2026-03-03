"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const NewsletterForm = dynamic(() => import("@/components/NewsletterForm"), {
  ssr: false,
});

export default function LazyNewsletterForm() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={containerRef}>
      {shouldLoad ? (
        <NewsletterForm />
      ) : (
        <div className="content-stretch flex flex-col sm:flex-row gap-4 items-start justify-start relative shrink-0 w-full">
          <div className="basis-0 grow min-h-9 min-w-px relative shrink-0 w-full sm:w-auto">
            <div className="h-9 rounded-md border border-white/20 bg-black/20" />
          </div>
          <div className="h-9 w-full sm:w-28 rounded-md bg-white/20" />
        </div>
      )}
    </div>
  );
}
