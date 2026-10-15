"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

const LiveCross = dynamic(() => import("./three/A0TYRotatingCross").then(mod => mod.A0TYRotatingCross), { ssr: false });
const desktopQuery = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
function subscribe(callback: () => void) {
  const query = window.matchMedia(desktopQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

class CrossFallback extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function AotyCross() {
  const desktop = useSyncExternalStore(subscribe, () => window.matchMedia(desktopQuery).matches, () => false);
  const [activated, setActivated] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);
  const live = desktop || activated;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (ref.current) observer.observe(ref.current);
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);

  return (
    <div ref={ref} className="absolute inset-0">
      {live && (
        <CrossFallback onError={onError}>
          <LiveCross active={visible && tabVisible} onReady={onReady} />
        </CrossFallback>
      )}
      <picture>
        <source media="(min-width: 768px)" srcSet="/aoty-cross-desktop-poster.webp" />
        <Image
          src="/aoty-cross-poster.webp"
          alt="Metallic A0TY cross"
          fill
          unoptimized
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 1280px) 50vw, 100vw"
          className={`object-fill pointer-events-none transition-opacity duration-300 ${live && ready && !failed ? "opacity-0" : "opacity-100"}`}
        />
      </picture>
      {!desktop && (
        <button
          type="button"
          onClick={() => { setReady(false); setFailed(false); setActivated(value => !value); }}
          aria-pressed={activated}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 border border-white/50 bg-black/70 px-4 py-2 text-white text-sm whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {activated ? (failed ? "3D unavailable · use poster" : ready ? "Pause 3D" : "Cancel 3D") : "Interact with 3D"}
        </button>
      )}
    </div>
  );
}
