"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

/**
 * Configuration for the A0TY Rotating Cross
 */
const CONFIG = {
  camera: {
    position: [0, 0, 8] as [number, number, number],
    fov: 50,
  },
  rotation: {
    baseSpeed: 0.01, // Base rotation speed on X axis
    maxSpeed: 0.2, // Maximum rotation speed
    dragMultiplier: 0.005, // How much dragging affects speed
    decayRate: 0.98, // How quickly extra speed decays back to base
  },
  materials: {
    cross: {
      metalness: 0.9,
      roughness: 0.2,
      envMapIntensity: 1.0,
      emissiveColor: 0x222222,
      emissiveIntensity: 0.2,
    },
  },
  effects: {
    bloom: {
      intensity: 0.2,
      luminanceThreshold: 0.3,
      luminanceSmoothing: 0.9,
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
function RotatingCross() {
  const { scene } = useGLTF("/cross.glb");
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const rotationSpeedRef = useRef(CONFIG.rotation.baseSpeed);
  const lastMouseY = useRef(0);

  // Animation loop - rotate on X axis
  useFrame(() => {
    if (!groupRef.current) return;

    // Apply rotation on X axis
    groupRef.current.rotation.x += rotationSpeedRef.current;

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

// Preload the model
useGLTF.preload("/cross.glb");

// Scene Content
function SceneContent() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={CONFIG.lighting.ambient.intensity} />
      <directionalLight
        position={CONFIG.lighting.directional.position}
        intensity={CONFIG.lighting.directional.intensity}
      />

      {/* Environment */}
      <Environment preset="sunset" resolution={128} />

      {/* Rotating Cross */}
      <RotatingCross />

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
export function A0TYRotatingCross() {
  return (
    <div className="w-full h-full relative">
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
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        frameloop="always"
        style={{ background: "transparent" }} // Ensure transparent background
      >
        <PerspectiveCamera makeDefault position={CONFIG.camera.position} fov={CONFIG.camera.fov} />
        <SceneContent />
      </Canvas>
    </div>
  );
}
