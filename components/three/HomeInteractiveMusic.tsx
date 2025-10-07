"use client";

import { useRef, useState, useEffect } from "react";

interface HomeInteractiveMusicProps {
  audioSrc: string;
  onFirstInteraction?: () => void;
  autoPlay?: boolean;
  isMuted?: boolean;
}

export function HomeInteractiveMusic({
  audioSrc,
  onFirstInteraction,
  autoPlay = false,
  isMuted = false,
}: HomeInteractiveMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Initialize Web Audio API on first play
  const initializeAudioContext = () => {
    if (audioRef.current && !audioContextRef.current) {
      console.log("Initializing Web Audio API...");
      const AudioContextConstructor =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextConstructor();
      audioContextRef.current = ctx;

      try {
        // Create simple audio graph
        const source = ctx.createMediaElementSource(audioRef.current);
        const gainNode = ctx.createGain();
        const filterNode = ctx.createBiquadFilter();

        // Connect: source -> filter -> gain -> destination
        source.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Set defaults
        gainNode.gain.value = 1.0;
        filterNode.type = "lowpass";
        filterNode.frequency.value = 22000;

        sourceNodeRef.current = source;
        gainNodeRef.current = gainNode;
        filterNodeRef.current = filterNode;

        console.log("Web Audio API initialized successfully");
      } catch (err) {
        console.error("Failed to initialize Web Audio API:", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Handle autoplay
  useEffect(() => {
    if (autoPlay && audioRef.current && !isPlaying) {
      initializeAudioContext();
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume();
      }
      audioRef.current.play().catch((err) => console.log("Audio autoplay failed:", err));
      setIsPlaying(true);
    }
  }, [autoPlay]);

  // Sync with muted prop
  useEffect(() => {
    if (audioRef.current) {
      if (isMuted && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else if (!isMuted && !isPlaying && autoPlay) {
        if (!audioContextRef.current) {
          initializeAudioContext();
        }
        if (audioContextRef.current?.state === "suspended") {
          audioContextRef.current.resume();
        }
        audioRef.current.play().catch((err) => console.log("Audio play failed:", err));
        setIsPlaying(true);
      }
    }
  }, [isMuted]);

  // React to physics events
  useEffect(() => {
    const handleGrab = () => {
      console.log("🎵 Music: Cross grabbed - pitch down");
      // Drop pitch down (like a record slowdown)
      if (audioRef.current && audioContextRef.current) {
        // Smooth pitch drop to lower octave
        const startRate = audioRef.current.playbackRate;
        const targetRate = 0.5; // One octave down
        const duration = 200; // ms
        const steps = 20;
        const stepTime = duration / steps;

        let currentStep = 0;
        const pitchInterval = setInterval(() => {
          if (audioRef.current && currentStep < steps) {
            currentStep++;
            const progress = currentStep / steps;
            audioRef.current.playbackRate = startRate - (startRate - targetRate) * progress;
          } else {
            clearInterval(pitchInterval);
          }
        }, stepTime);

        // Add filter sweep
        if (filterNodeRef.current && gainNodeRef.current) {
          const now = audioContextRef.current.currentTime;
          filterNodeRef.current.frequency.cancelScheduledValues(now);
          filterNodeRef.current.frequency.setValueAtTime(filterNodeRef.current.frequency.value, now);
          filterNodeRef.current.frequency.setTargetAtTime(400, now, 0.15);

          gainNodeRef.current.gain.cancelScheduledValues(now);
          gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, now);
          gainNodeRef.current.gain.setTargetAtTime(0.7, now, 0.1);
        }
      }
    };

    const handleRelease = () => {
      console.log("🎵 Music: Cross released - pitch up and normalize");
      // Pitch bend up on release (like releasing tension)
      if (audioRef.current && audioContextRef.current) {
        const now = audioContextRef.current.currentTime;

        // Quick pitch rise then settle
        const startRate = audioRef.current.playbackRate;
        const peakRate = 1.4; // Sharp pitch rise
        const normalRate = 1.0;
        const duration = 250; // ms
        const steps = 25;
        const stepTime = duration / steps;

        let currentStep = 0;
        const pitchInterval = setInterval(() => {
          if (audioRef.current && currentStep < steps) {
            currentStep++;
            const progress = currentStep / steps;

            // Rise to peak then fall to normal
            if (progress < 0.3) {
              audioRef.current.playbackRate = startRate + (peakRate - startRate) * (progress / 0.3);
            } else {
              audioRef.current.playbackRate = peakRate - (peakRate - normalRate) * ((progress - 0.3) / 0.7);
            }
          } else {
            if (audioRef.current) audioRef.current.playbackRate = normalRate;
            clearInterval(pitchInterval);
          }
        }, stepTime);

        // Remove filter with sparkle
        if (filterNodeRef.current && gainNodeRef.current) {
          filterNodeRef.current.frequency.cancelScheduledValues(now);
          filterNodeRef.current.frequency.setValueAtTime(filterNodeRef.current.frequency.value, now);
          filterNodeRef.current.frequency.setTargetAtTime(22000, now, 0.08);

          // Ensure gain returns to exactly 1.0
          gainNodeRef.current.gain.cancelScheduledValues(now);
          gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, now);
          gainNodeRef.current.gain.setTargetAtTime(1.2, now, 0.05);
          gainNodeRef.current.gain.setTargetAtTime(1.0, now + 0.05, 0.15);

          // Force to exactly 1.0 after animation
          setTimeout(() => {
            if (gainNodeRef.current && audioContextRef.current) {
              gainNodeRef.current.gain.setValueAtTime(1.0, audioContextRef.current.currentTime);
            }
          }, 250);
        }
      }
    };

    window.addEventListener("crossGrabbed", handleGrab as EventListener);
    window.addEventListener("crossReleased", handleRelease as EventListener);

    return () => {
      window.removeEventListener("crossGrabbed", handleGrab as EventListener);
      window.removeEventListener("crossReleased", handleRelease as EventListener);
    };
  }, []);

  const handleFirstInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      onFirstInteraction?.();

      // Initialize audio context on first interaction
      if (!audioContextRef.current) {
        initializeAudioContext();
      }

      // Resume audio context (required for some browsers)
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume();
      }

      // Auto-play audio on first interaction
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().catch((err) => console.log("Audio play failed:", err));
        setIsPlaying(true);
      }
    }
  };

  return (
    <>
      {/* Audio element (hidden, audio only from MP4) */}
      <audio ref={audioRef} loop>
        <source src={audioSrc} type="audio/mp4" />
      </audio>

      {/* Invisible overlay to capture first interaction */}
      {!hasInteracted && <div className="absolute inset-0 z-[5]" onPointerDown={handleFirstInteraction} />}
    </>
  );
}
