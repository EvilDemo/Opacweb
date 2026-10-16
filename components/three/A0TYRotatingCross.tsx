"use client";

import { addAfterEffect, Canvas, useFrame } from "@react-three/fiber";
import { Environment, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { useCallback, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

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
};

// Rotating Cross Component
function RotatingCross({ onReady }: { onReady?: () => void }) {
  const { scene } = useGLTF("/cross.glb");
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const rotationSpeedRef = useRef(CONFIG.rotation.baseSpeed);
  const lastMouseY = useRef(0);

  useEffect(() => {
    // Keep the poster until the loaded scene has completed its first render.
    const unsubscribe = addAfterEffect(() => {
      unsubscribe();
      onReady?.();
    });
    return unsubscribe;
  }, [onReady]);

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

  // Modify the cached scene once on mount
  useEffect(() => {
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
  }, [scene]);

  return (
    <group ref={groupRef} position={[0, 0, 0]} onPointerDown={handlePointerDown}>
      <primitive object={scene} scale={1} />
    </group>
  );
}

// Scene Content
function SceneContent({ onReady }: { onReady?: () => void }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={CONFIG.lighting.ambient.intensity} />
      <directionalLight
        position={CONFIG.lighting.directional.position}
        intensity={CONFIG.lighting.directional.intensity}
      />

      {/* Environment */}
      <Environment preset="studio" resolution={128} />

      {/* Rotating Cross */}
      <RotatingCross onReady={onReady} />

      {/* Post-Processing Effects */}
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={CONFIG.effects.bloom.intensity}
          luminanceThreshold={CONFIG.effects.bloom.luminanceThreshold}
          luminanceSmoothing={CONFIG.effects.bloom.luminanceSmoothing}
          mipmapBlur={CONFIG.effects.bloom.mipmapBlur}
        />
      </EffectComposer>
    </>
  );
}

// Main Component
export function A0TYRotatingCross({ active = true, onReady, onError }: { active?: boolean; onReady?: () => void; onError?: () => void }) {
  const createRenderer = useCallback((defaults: THREE.WebGLRendererParameters) => {
    try {
      return new THREE.WebGLRenderer({
        ...defaults,
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
        stencil: false,
        depth: true,
      });
    } catch (error) {
      // Canvas initializes asynchronously, outside the scene's React error boundary.
      onError?.();
      throw error;
    }
  }, [onError]);

  return (
    <div className="absolute inset-0">
      <Canvas
        gl={createRenderer}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        frameloop={active ? "always" : "never"}
        style={{ background: "transparent" }} // Ensure transparent background
      >
        <PerspectiveCamera makeDefault position={CONFIG.camera.position} fov={CONFIG.camera.fov} />
        <SceneContent onReady={onReady} />
      </Canvas>
    </div>
  );
}
