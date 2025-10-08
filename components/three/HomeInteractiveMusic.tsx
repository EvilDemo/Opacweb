"use client";

import { useRef, useEffect } from "react";

interface HomeInteractiveMusicProps {
  audioSrc: string;
  autoPlay?: boolean;
  isMuted?: boolean;
}

export function HomeInteractiveMusic({ audioSrc, autoPlay = false, isMuted = false }: HomeInteractiveMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (autoPlay && !isMuted) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [autoPlay, isMuted]);

  return (
    <audio ref={audioRef} loop>
      <source src={audioSrc} type="audio/mp4" />
    </audio>
  );
}
