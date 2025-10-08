"use client";

import { useRef, useEffect } from "react";

interface HomeInteractiveMusicProps {
  audioSrc: string;
  autoPlay?: boolean;
  isMuted?: boolean;
}

interface AudioEffectConfig {
  audio: {
    initialGain: number;
    filterType: BiquadFilterType;
    initialFilterFrequency: number;
  };
  grab: {
    pitch: { targetRate: number; duration: number; steps: number };
    filter: { targetFrequency: number; timeConstant: number };
    gain: { targetGain: number; timeConstant: number };
  };
  release: {
    pitch: { peakRate: number; normalRate: number; duration: number; steps: number; risePhase: number };
    filter: { targetFrequency: number; timeConstant: number };
    gain: {
      peakGain: number;
      finalGain: number;
      riseTimeConstant: number;
      settleTimeConstant: number;
      settleDelay: number;
      forceFinalDuration: number;
    };
  };
}

const AUDIO_CONFIG: AudioEffectConfig = {
  audio: { initialGain: 1.0, filterType: "lowpass", initialFilterFrequency: 22000 },
  grab: {
    pitch: { targetRate: 0.5, duration: 200, steps: 20 },
    filter: { targetFrequency: 400, timeConstant: 0.15 },
    gain: { targetGain: 0.7, timeConstant: 0.1 },
  },
  release: {
    pitch: { peakRate: 1.4, normalRate: 1.0, duration: 250, steps: 25, risePhase: 0.3 },
    filter: { targetFrequency: 22000, timeConstant: 0.08 },
    gain: {
      peakGain: 1.2,
      finalGain: 1.0,
      riseTimeConstant: 0.05,
      settleTimeConstant: 0.15,
      settleDelay: 0.05,
      forceFinalDuration: 250,
    },
  },
};

function animatePitchBend(
  audioElement: HTMLAudioElement,
  startRate: number,
  targetRate: number,
  duration: number,
  steps: number,
  onComplete?: () => void
): () => void {
  const stepTime = duration / steps;
  let currentStep = 0;
  const interval = setInterval(() => {
    if (currentStep < steps) {
      currentStep++;
      const progress = currentStep / steps;
      audioElement.playbackRate = startRate + (targetRate - startRate) * progress;
    } else {
      clearInterval(interval);
      onComplete?.();
    }
  }, stepTime);
  return () => clearInterval(interval);
}

function animatePitchRiseFall(
  audioElement: HTMLAudioElement,
  startRate: number,
  peakRate: number,
  finalRate: number,
  duration: number,
  steps: number,
  risePhase: number
): () => void {
  const stepTime = duration / steps;
  let currentStep = 0;
  const interval = setInterval(() => {
    if (currentStep < steps) {
      currentStep++;
      const progress = currentStep / steps;
      if (progress < risePhase) {
        audioElement.playbackRate = startRate + (peakRate - startRate) * (progress / risePhase);
      } else {
        audioElement.playbackRate = peakRate - (peakRate - finalRate) * ((progress - risePhase) / (1 - risePhase));
      }
    } else {
      audioElement.playbackRate = finalRate;
      clearInterval(interval);
    }
  }, stepTime);
  return () => clearInterval(interval);
}

export function HomeInteractiveMusic({ audioSrc, autoPlay = false, isMuted = false }: HomeInteractiveMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const cleanupPitchRef = useRef<(() => void) | null>(null);

  // Initialize audio context once
  useEffect(() => {
    if (!audioRef.current || audioContextRef.current) return;

    const AudioContextConstructor =
      window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextConstructor();
    audioContextRef.current = ctx;

    const source = ctx.createMediaElementSource(audioRef.current);
    const gainNode = ctx.createGain();
    const filterNode = ctx.createBiquadFilter();

    source.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(ctx.destination);

    gainNode.gain.value = AUDIO_CONFIG.audio.initialGain;
    filterNode.type = AUDIO_CONFIG.audio.filterType;
    filterNode.frequency.value = AUDIO_CONFIG.audio.initialFilterFrequency;

    sourceNodeRef.current = source;
    gainNodeRef.current = gainNode;
    filterNodeRef.current = filterNode;

    return () => {
      cleanupPitchRef.current?.();
    };
  }, []);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    const ctx = audioContextRef.current;

    if (!audio || !ctx) return;

    if (autoPlay && !isMuted) {
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [autoPlay, isMuted]);

  // Physics event handlers
  useEffect(() => {
    const handleGrab = () => {
      if (!audioRef.current || !audioContextRef.current) return;
      cleanupPitchRef.current?.();

      const startRate = audioRef.current.playbackRate;
      cleanupPitchRef.current = animatePitchBend(
        audioRef.current,
        startRate,
        AUDIO_CONFIG.grab.pitch.targetRate,
        AUDIO_CONFIG.grab.pitch.duration,
        AUDIO_CONFIG.grab.pitch.steps
      );

      if (filterNodeRef.current && gainNodeRef.current) {
        const now = audioContextRef.current.currentTime;
        filterNodeRef.current.frequency.cancelScheduledValues(now);
        filterNodeRef.current.frequency.setValueAtTime(filterNodeRef.current.frequency.value, now);
        filterNodeRef.current.frequency.setTargetAtTime(
          AUDIO_CONFIG.grab.filter.targetFrequency,
          now,
          AUDIO_CONFIG.grab.filter.timeConstant
        );

        gainNodeRef.current.gain.cancelScheduledValues(now);
        gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, now);
        gainNodeRef.current.gain.setTargetAtTime(
          AUDIO_CONFIG.grab.gain.targetGain,
          now,
          AUDIO_CONFIG.grab.gain.timeConstant
        );
      }
    };

    const handleRelease = () => {
      if (!audioRef.current || !audioContextRef.current) return;
      cleanupPitchRef.current?.();

      const startRate = audioRef.current.playbackRate;
      cleanupPitchRef.current = animatePitchRiseFall(
        audioRef.current,
        startRate,
        AUDIO_CONFIG.release.pitch.peakRate,
        AUDIO_CONFIG.release.pitch.normalRate,
        AUDIO_CONFIG.release.pitch.duration,
        AUDIO_CONFIG.release.pitch.steps,
        AUDIO_CONFIG.release.pitch.risePhase
      );

      if (filterNodeRef.current && gainNodeRef.current) {
        const now = audioContextRef.current.currentTime;
        filterNodeRef.current.frequency.cancelScheduledValues(now);
        filterNodeRef.current.frequency.setValueAtTime(filterNodeRef.current.frequency.value, now);
        filterNodeRef.current.frequency.setTargetAtTime(
          AUDIO_CONFIG.release.filter.targetFrequency,
          now,
          AUDIO_CONFIG.release.filter.timeConstant
        );

        gainNodeRef.current.gain.cancelScheduledValues(now);
        gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, now);
        gainNodeRef.current.gain.setTargetAtTime(
          AUDIO_CONFIG.release.gain.peakGain,
          now,
          AUDIO_CONFIG.release.gain.riseTimeConstant
        );
        gainNodeRef.current.gain.setTargetAtTime(
          AUDIO_CONFIG.release.gain.finalGain,
          now + AUDIO_CONFIG.release.gain.settleDelay,
          AUDIO_CONFIG.release.gain.settleTimeConstant
        );

        setTimeout(() => {
          if (gainNodeRef.current && audioContextRef.current) {
            gainNodeRef.current.gain.setValueAtTime(
              AUDIO_CONFIG.release.gain.finalGain,
              audioContextRef.current.currentTime
            );
          }
        }, AUDIO_CONFIG.release.gain.forceFinalDuration);
      }
    };

    window.addEventListener("crossGrabbed", handleGrab as EventListener);
    window.addEventListener("crossReleased", handleRelease as EventListener);

    return () => {
      window.removeEventListener("crossGrabbed", handleGrab as EventListener);
      window.removeEventListener("crossReleased", handleRelease as EventListener);
      cleanupPitchRef.current?.();
    };
  }, []);

  return (
    <audio ref={audioRef} loop>
      <source src={audioSrc} type="audio/mp4" />
    </audio>
  );
}
