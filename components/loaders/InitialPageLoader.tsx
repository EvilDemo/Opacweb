"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function InitialPageLoader({ minimumLoadTime, onComplete }: {
  minimumLoadTime: number;
  onComplete: () => void;
}) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : minimumLoadTime;
    const fade = setTimeout(() => setExiting(true), Math.max(0, duration - 150));
    const complete = setTimeout(onComplete, duration);
    return () => { clearTimeout(fade); clearTimeout(complete); };
  }, [minimumLoadTime, onComplete]);

  return (
    <div aria-hidden="true" className={`pointer-events-none fixed flex flex-col lg:flex-row padding-global inset-0 z-[100] bg-black transition-opacity duration-150 motion-reduce:transition-none ${exiting ? "opacity-0" : "opacity-100"}`}>
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div className="relative w-96 h-96 lg:w-[32rem] lg:h-[32rem] xl:w-[40rem] xl:h-[40rem] overflow-hidden rounded-full">
          <Image src="/sphere-poster.webp" alt="" fill sizes="(min-width: 1280px) 640px, 384px" className="object-contain" />
        </div>
      </div>
      <div className="w-full lg:flex-1 flex items-end justify-end p-8 lg:p-16">
        <span className="heading-1 text-white tracking-wider mb-2">opac</span>
      </div>
    </div>
  );
}
