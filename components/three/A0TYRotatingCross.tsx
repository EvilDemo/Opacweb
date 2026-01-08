"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { useRef, useState, useEffect, Suspense } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useMediaQuery } from "@/lib/hooks";

/**
 * Configuration for the A0TY Rotating Cross
 */
const CONFIG = {
  camera: {
    position: [0, 0, 12] as [number, number, number],
    fov: 50,
  },
  rotation: {
    baseSpeed: 0.01, // Base rotation speed on Y axis (horizontal)
    maxSpeed: 0.2, // Maximum rotation speed
    dragMultiplier: 0.005, // How much dragging affects speed
    decayRate: 0.98, // How quickly extra speed decays back to base
  },
  materials: {
    cross: {
      metalness: 0.7,
      roughness: 0.4,
      envMapIntensity: 0.5,
      emissiveColor: 0x111111,
      emissiveIntensity: 0.05,
    },
  },
  effects: {
    bloom: {
      intensity: 0.02,
      luminanceThreshold: 0.9,
      luminanceSmoothing: 0.2,
      mipmapBlur: true,
    },
  },
  lighting: {
    ambient: {
      intensity: 0.5,
    },
    directional: {
      position: [5, 5, 5] as [number, number, number],
      intensity: 1,
    },
  },
  mobile: {
    dpr: [1, 1] as [number, number],
    environmentResolution: 64,
    bloomEnabled: false,
  },
  timing: {
    crossAppearDelay: 800,
  },
};

// Rotating Cross Component
function RotatingCross({ onModelLoaded, visible = true }: { onModelLoaded?: () => void; visible?: boolean }) {
  const { scene } = useGLTF("/cross.glb");

  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const rotationSpeedRef = useRef(CONFIG.rotation.baseSpeed);
  const lastMouseY = useRef(0);
  const hasNotifiedLoaded = useRef(false);

  // Animation loop - rotate on Y axis (horizontal)
  useFrame(() => {
    if (!groupRef.current) return;

    // Apply rotation on Y axis for horizontal spinning
    groupRef.current.rotation.y += rotationSpeedRef.current;

    // Decay extra speed back to base speed if not dragging
    if (!isDragging && rotationSpeedRef.current > CONFIG.rotation.baseSpeed) {
      rotationSpeedRef.current = Math.max(
        CONFIG.rotation.baseSpeed,
        rotationSpeedRef.current * CONFIG.rotation.decayRate
      );
    }
  });

  // Handle drag to increase rotation speed
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (event: PointerEvent) => {
      event.preventDefault();

      const deltaY = event.clientY - lastMouseY.current;
      lastMouseY.current = event.clientY;

      // Increase speed based on drag velocity
      const speedIncrease = Math.abs(deltaY) * CONFIG.rotation.dragMultiplier;
      rotationSpeedRef.current = Math.min(CONFIG.rotation.maxSpeed, rotationSpeedRef.current + speedIncrease);
    };

    const handleRelease = () => {
      setIsDragging(false);
    };

    window.addEventListener("pointermove", handleMove, { passive: false });
    window.addEventListener("pointerup", handleRelease);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleRelease);
    };
  }, [isDragging]);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    lastMouseY.current = event.clientY;
    setIsDragging(true);
  };

  // Modify the cached scene once on mount and notify when ready
  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.metalness = CONFIG.materials.cross.metalness;
          child.material.roughness = CONFIG.materials.cross.roughness;
          child.material.envMapIntensity = CONFIG.materials.cross.envMapIntensity;
          child.material.emissive = new THREE.Color(CONFIG.materials.cross.emissiveColor);
          child.material.emissiveIntensity = CONFIG.materials.cross.emissiveIntensity;
          child.material.needsUpdate = true;
        }
      }
    });

    // Notify parent that model is loaded and ready (only once)
    // Use double requestAnimationFrame to ensure scene is fully processed
    if (onModelLoaded && !hasNotifiedLoaded.current) {
      hasNotifiedLoaded.current = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          onModelLoaded();
        });
      });
    }
  }, [scene, onModelLoaded]);

  return (
    <group ref={groupRef} position={[0, 0, 0]} onPointerDown={handlePointerDown} visible={visible}>
      <primitive object={scene} scale={1} />
    </group>
  );
}

// Preload the model - moved to component level to avoid module-level execution
// useGLTF.preload("/cross.glb");

// Scene Content
function SceneContent({
  isMobile,
  onModelLoaded,
  showCross,
}: {
  isMobile: boolean;
  onModelLoaded?: () => void;
  showCross: boolean;
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={CONFIG.lighting.ambient.intensity} />
      <directionalLight
        position={CONFIG.lighting.directional.position}
        intensity={CONFIG.lighting.directional.intensity}
      />

      {/* Environment */}
      <Environment preset="studio" resolution={isMobile ? CONFIG.mobile.environmentResolution : 128} />

      {/* Rotating Cross - always render to load model, but only visible when showCross is true */}
      <RotatingCross onModelLoaded={onModelLoaded} visible={showCross} />

      {/* Post-Processing Effects - Desktop Only */}
      {!isMobile && showCross && (
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={CONFIG.effects.bloom.intensity}
            luminanceThreshold={CONFIG.effects.bloom.luminanceThreshold}
            luminanceSmoothing={CONFIG.effects.bloom.luminanceSmoothing}
            mipmapBlur={CONFIG.effects.bloom.mipmapBlur}
          />
        </EffectComposer>
      )}
    </>
  );
}

// Main Component
export function A0TYRotatingCross() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [mounted, setMounted] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [showCross, setShowCross] = useState(false);
  const [hideLoader, setHideLoader] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Ensure component is mounted on client before rendering Canvas
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Use double requestAnimationFrame to ensure browser is ready and DOM is fully rendered
      const rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setMounted(true);
        });
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, []);

  // Wait for container to be in DOM and WebGL to be available before rendering Canvas
  useEffect(() => {
    if (mounted && canvasContainerRef.current && typeof window !== "undefined") {
      let timeoutId: NodeJS.Timeout | null = null;
      let rafId: number | null = null;
      let cancelled = false;

      // Check if WebGL is available
      const checkWebGL = () => {
        try {
          const canvas = document.createElement("canvas");
          const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
          return !!gl;
        } catch (e) {
          return false;
        }
      };

      // Additional check to ensure container is actually in the DOM and WebGL is available
      const checkReady = () => {
        if (cancelled) return;

        if (canvasContainerRef.current && document.body.contains(canvasContainerRef.current) && checkWebGL()) {
          // Small delay to ensure everything is settled
          timeoutId = setTimeout(() => {
            if (!cancelled) {
              setCanvasReady(true);
            }
          }, 50);
        } else {
          // Retry if not ready yet
          rafId = requestAnimationFrame(checkReady);
        }
      };
      // Use requestAnimationFrame to ensure DOM is ready
      rafId = requestAnimationFrame(checkReady);

      return () => {
        cancelled = true;
        if (timeoutId) clearTimeout(timeoutId);
        if (rafId) cancelAnimationFrame(rafId);
      };
    }
  }, [mounted]);

  // Preload is now handled at page level (app/a0ty/page.tsx) for earlier loading
  // Model should already be downloading when this component mounts

  // Handle model loaded callback
  const handleModelLoaded = () => {
    setModelLoaded(true);
  };

  // Show cross and hide loader only after model is actually loaded
  useEffect(() => {
    if (!modelLoaded) return;

    // Hide loader slightly before cross appears for smooth transition
    const loaderTimer = setTimeout(() => {
      setHideLoader(true);
    }, 100); // Small delay for transition

    // Show cross after loader starts hiding
    const crossTimer = setTimeout(() => {
      setShowCross(true);
    }, 200);

    return () => {
      clearTimeout(loaderTimer);
      clearTimeout(crossTimer);
    };
  }, [modelLoaded]);

  // Don't render Canvas until mounted on client and in browser
  if (!mounted || typeof window === "undefined") {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-white"></div>
          <p className="body-text-sm text-white/80">Loading cross...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0" ref={canvasContainerRef}>
      {/* Show loading until cross is ready (hides slightly earlier for smooth transition) */}
      {!hideLoader && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-white"></div>
            <p className="body-text-sm text-white/80">Loading cross...</p>
          </div>
        </div>
      )}
      {canvasReady && typeof window !== "undefined" && (
        <Suspense fallback={null}>
          <Canvas
            gl={{
              alpha: true, // Transparent background
              antialias: false,
              powerPreference: "high-performance",
              preserveDrawingBuffer: false,
              failIfMajorPerformanceCaveat: false,
              stencil: false,
              depth: true,
            }}
            dpr={isMobile ? CONFIG.mobile.dpr : [1, 1.5]}
            performance={{ min: 0.5 }}
            frameloop="always"
            style={{ background: "transparent" }} // Ensure transparent background
          >
            <PerspectiveCamera makeDefault position={CONFIG.camera.position} fov={CONFIG.camera.fov} />
            {/* Render SceneContent to start loading model, but only show cross when modelLoaded */}
            <SceneContent isMobile={isMobile} onModelLoaded={handleModelLoaded} showCross={showCross} />
          </Canvas>
        </Suspense>
      )}
    </div>
  );
}
