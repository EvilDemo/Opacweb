"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform } from "motion/react";

export function useHorizontalScroll(contentKey: unknown) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ scrollDistance: 0, sectionHeight: 0 });
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const { scrollYProgress } = useScroll({ target: scrollRef, offset: ["start start", "end start"] });

  useEffect(() => {
    const section = scrollRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const measure = () => {
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      const scrollDistance = desktop ? Math.max(0, content.scrollWidth - section.clientWidth) : 0;
      setIsLargeScreen(desktop);
      setDimensions((previous) => {
        const sectionHeight = desktop ? window.innerHeight + scrollDistance : 0;
        return previous.scrollDistance === scrollDistance && previous.sectionHeight === sectionHeight
          ? previous
          : { scrollDistance, sectionHeight };
      });
    };

    // Observe rendered widths, including filter changes, fonts and responsive card sizes.
    const observer = new ResizeObserver(measure);
    observer.observe(section);
    observer.observe(content);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [contentKey]);

  // useScroll's end is the section's bottom reaching the viewport top.
  // Finish when the sticky viewport releases, rather than adding blank travel.
  const progressAtRelease = dimensions.sectionHeight
    ? dimensions.scrollDistance / dimensions.sectionHeight
    : 1;
  const xTransform = useTransform(
    scrollYProgress,
    [0, progressAtRelease || 1],
    [0, isLargeScreen ? -dimensions.scrollDistance : 0]
  );

  return { scrollRef, contentRef, dimensions, isLargeScreen, xTransform };
}
