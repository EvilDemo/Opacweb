"use client";

import { useEffect, useRef, type VideoHTMLAttributes } from "react";

type Props = Omit<VideoHTMLAttributes<HTMLVideoElement>, "src" | "autoPlay" | "preload" | "children"> & {
  src: string;
};

/** Attach the source near the viewport, but decode/play only while visible. */
export default function ViewportVideo({ src, ...props }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let loaded = false;
    let disposed = false;
    const updatePlayback = () => {
      if (!loaded || !visible || document.hidden || motion.matches) {
        video.pause();
        return;
      }
      void video.play().catch(() => {
        // Offer playback when a browser's autoplay policy blocks the animation.
        if (!disposed && visible && !document.hidden) video.controls = true;
      });
    };
    const updateMotion = () => {
      video.controls = motion.matches || Boolean(props.controls);
      updatePlayback();
    };
    const near = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      loaded = true;
      video.src = src;
      video.load();
      updatePlayback();
      near.disconnect();
    }, { rootMargin: "160px" });
    const inView = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updatePlayback();
    });
    near.observe(video);
    inView.observe(video);
    updateMotion();
    document.addEventListener("visibilitychange", updatePlayback);
    motion.addEventListener("change", updateMotion);
    return () => {
      disposed = true;
      near.disconnect();
      inView.disconnect();
      document.removeEventListener("visibilitychange", updatePlayback);
      motion.removeEventListener("change", updateMotion);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [src, props.controls]);

  return <video {...props} ref={ref} preload="none" />;
}
