"use client";

import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";
import { Environment, PerspectiveCamera, useGLTF, Stats } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import type { RapierRigidBody } from "@react-three/rapier";
import type { ThreeEvent } from "@react-three/fiber";
import { HomeInteractiveMusic } from "./HomeInteractiveMusic";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Button } from "@/components/ui/button";

/**
 * Configuration for the Interactive Canvas
 */
const CONFIG = {
  camera: {
    position: [0, -3, 12] as [number, number, number],
    fov: 70,
  },
  physics: {
    gravity: [0, -9.81, 0] as [number, number, number],
    cross: {
      restitution: 0.8,
      friction: 0.1,
      linearDamping: 0.2,
      angularDamping: 0.2,
      initialRotation: [Math.PI, 0, 0] as [number, number, number],
      scale: 1,
    },
    walls: {
      restitution: 0.8,
      thickness: 0.5,
    },
    interaction: {
      throwForceMultiplier: 50,
      torqueMultipliers: [0.3, 0.3, 0.2] as [number, number, number],
    },
  },
  boundaries: {
    width: 32, // Wider to cover full viewport width
    height: 20, // Taller to ensure floor catches everything
    depth: 14,
    ceilingHeightMultiplier: 0.5,
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
      intensity: 0.1,
      luminanceThreshold: 0.2,
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
  timing: {
    crossAppearDelay: 1600,
    instructionsAppearDelay: 2600,
    textAnimationDuration: 1.5,
    sideWallButtonDuration: 10000,
  },
  animation: {
    textInitialDepth: "-500px",
    textFinalDepth: "0px",
  },
};

// Invisible Walls Component
function BoundaryWalls() {
  const { width, height, depth, ceilingHeightMultiplier } = CONFIG.boundaries;
  const { thickness, restitution } = CONFIG.physics.walls;

  const ceilingHeight = (height / 2) * ceilingHeightMultiplier;
  const floorHeight = height / 2;
  const wallHeight = height * 1.5; // Make walls taller to ensure they catch everything

  const handleWallCollision = (wallType: string, position: { x: number; y: number; z: number }) => {
    console.log("Collision with:", wallType);
    window.dispatchEvent(
      new CustomEvent("wallImpact", {
        detail: {
          wallType,
          position,
          velocity: 10, // Default velocity for the effect
        },
      })
    );
  };

  return (
    <>
      {/* Left Wall */}
      <CuboidCollider
        position={[-width / 2, -3, 0]}
        args={[thickness / 2, wallHeight / 2, depth / 2]}
        restitution={restitution}
        friction={0.1}
        onCollisionEnter={() => handleWallCollision("left", { x: -width / 2, y: -3, z: 0 })}
      />

      {/* Right Wall */}
      <CuboidCollider
        position={[width / 2, -3, 0]}
        args={[thickness / 2, wallHeight / 2, depth / 2]}
        restitution={restitution}
        friction={0.1}
        onCollisionEnter={() => handleWallCollision("right", { x: width / 2, y: -3, z: 0 })}
      />

      {/* Floor */}
      <CuboidCollider
        position={[0, -8, 0]}
        args={[width, thickness / 2, depth]}
        restitution={restitution}
        friction={0.1}
        onCollisionEnter={() => handleWallCollision("floor", { x: 0, y: -8, z: 0 })}
      />

      {/* Ceiling */}
      <CuboidCollider
        position={[0, ceilingHeight, 0]}
        args={[width / 2, thickness / 2, depth / 2]}
        restitution={restitution}
        friction={0.1}
        onCollisionEnter={() => handleWallCollision("ceiling", { x: 0, y: ceilingHeight, z: 0 })}
      />
    </>
  );
}

// Interactive Cross Component
function InteractiveCross() {
  const { scene } = useGLTF("/cross.glb");
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const [isGrabbed, setIsGrabbed] = useState(false);
  const currentMousePos = useRef<THREE.Vector3>(new THREE.Vector3());
  const { camera, viewport } = useThree();

  // Global pointer move handler
  useEffect(() => {
    if (!isGrabbed) return;

    const handleMove = (event: PointerEvent) => {
      event.preventDefault();

      if (rigidBodyRef.current) {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -(event.clientY / window.innerHeight) * 2 + 1;

        const mouse = new THREE.Vector2(x, y);
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersectPoint);

        // Clamp position to boundaries - match the actual wall positions
        const wallPadding = 1; // Keep cross slightly away from walls
        const { width, height, ceilingHeightMultiplier } = CONFIG.boundaries;
        const halfWidth = width / 2 - wallPadding; // Match wall positions at width/2
        const ceilingY = (height / 2) * ceilingHeightMultiplier;
        const floorY = -8; // Match the floor position

        intersectPoint.x = Math.max(-halfWidth, Math.min(halfWidth, intersectPoint.x));
        intersectPoint.y = Math.max(floorY + 1, Math.min(ceilingY - 1, intersectPoint.y)); // Keep away from floor/ceiling
        intersectPoint.z = 0;

        // Store current position for throw velocity calculation
        const pos = rigidBodyRef.current.translation();
        currentMousePos.current.set(pos.x, pos.y, pos.z);

        rigidBodyRef.current.setTranslation(intersectPoint, true);
      }
    };

    const handleRelease = () => {
      if (rigidBodyRef.current) {
        const pos = rigidBodyRef.current.translation();
        const currentPos = new THREE.Vector3(pos.x, pos.y, pos.z);

        const velocity = currentPos.clone().sub(currentMousePos.current);
        const throwForce = velocity.multiplyScalar(CONFIG.physics.interaction.throwForceMultiplier);

        rigidBodyRef.current.setLinvel({ x: throwForce.x, y: throwForce.y, z: 0 }, true);

        const torque = new THREE.Vector3(
          -throwForce.y * CONFIG.physics.interaction.torqueMultipliers[0],
          throwForce.x * CONFIG.physics.interaction.torqueMultipliers[1],
          throwForce.length() * CONFIG.physics.interaction.torqueMultipliers[2]
        );
        rigidBodyRef.current.setAngvel({ x: torque.x, y: torque.y, z: torque.z }, true);

        setIsGrabbed(false);
      }
    };

    window.addEventListener("pointermove", handleMove, { passive: false });
    window.addEventListener("pointerup", handleRelease);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleRelease);
    };
  }, [isGrabbed, camera]);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();

    if (rigidBodyRef.current) {
      // Freeze the cross
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);

      // Store current position
      const pos = rigidBodyRef.current.translation();
      currentMousePos.current.set(pos.x, pos.y, pos.z);

      setIsGrabbed(true);
    }
  };

  // Setup material once on mount
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
    <RigidBody
      ref={rigidBodyRef}
      position={[0, 0, 0]}
      rotation={CONFIG.physics.cross.initialRotation}
      restitution={CONFIG.physics.cross.restitution}
      friction={CONFIG.physics.cross.friction}
      colliders="hull"
      linearDamping={CONFIG.physics.cross.linearDamping}
      angularDamping={CONFIG.physics.cross.angularDamping}
      gravityScale={isGrabbed ? 0 : 1}
      ccd={true}
      enabledTranslations={[true, true, false]}
    >
      <group onPointerDown={handlePointerDown}>
        <primitive object={scene} scale={CONFIG.physics.cross.scale} />
      </group>
    </RigidBody>
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

      {/* Physics World */}
      <Physics gravity={CONFIG.physics.gravity}>
        <BoundaryWalls />
        <InteractiveCross />
      </Physics>

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
export function HomeInteractiveCanvas({ isMuted = false }: { isMuted?: boolean }) {
  const [showCross, setShowCross] = useState(false);
  const [animateText, setAnimateText] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSideWallButton, setShowSideWallButton] = useState(false);
  const sideWallTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start text animation immediately
    setAnimateText(true);

    // Show cross after text animation completes
    const crossTimer = setTimeout(() => {
      setShowCross(true);
    }, CONFIG.timing.crossAppearDelay);

    // Show instructions after cross appears
    const instructionsTimer = setTimeout(() => {
      setShowInstructions(true);
    }, CONFIG.timing.instructionsAppearDelay);

    // Prevent body scroll on mobile when AOTY mode is active
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.touchAction = "none";

    return () => {
      clearTimeout(crossTimer);
      clearTimeout(instructionsTimer);

      // Restore original body styles
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.touchAction = originalTouchAction;
    };
  }, []);

  // Listen for side wall impacts
  useEffect(() => {
    const handleWallImpact = (event: CustomEvent) => {
      const { wallType } = event.detail;
      console.log("handleWallImpact received:", wallType);

      // Only show button for side walls (left or right)
      if (wallType === "left" || wallType === "right") {
        console.log("Showing side wall button!");
        // Show button and restart timer every time a side wall is hit
        setShowSideWallButton(true);

        // Clear any existing timer
        if (sideWallTimerRef.current) {
          clearTimeout(sideWallTimerRef.current);
        }

        // Set new timer to hide button
        sideWallTimerRef.current = setTimeout(() => {
          setShowSideWallButton(false);
          sideWallTimerRef.current = null;
        }, CONFIG.timing.sideWallButtonDuration);
      }
    };

    window.addEventListener("wallImpact", handleWallImpact as EventListener);

    return () => {
      window.removeEventListener("wallImpact", handleWallImpact as EventListener);
      if (sideWallTimerRef.current) {
        clearTimeout(sideWallTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className="w-full relative"
      style={{
        height: "calc(100vh - 6rem)",
        touchAction: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
    >
      {/* Background Text Content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-start pt-4 text-white pointer-events-none z-10"
        style={{
          transform: animateText
            ? `perspective(1000px) translateZ(${CONFIG.animation.textFinalDepth})`
            : `perspective(1000px) translateZ(${CONFIG.animation.textInitialDepth})`,
          opacity: animateText ? 1 : 0,
          transition: `transform ${CONFIG.timing.textAnimationDuration}s ease-out, opacity ${CONFIG.timing.textAnimationDuration}s ease-out`,
        }}
      >
        <h1 className="heading-1 font-bold">A0TY</h1>
        <h4 className="body-text-lg">Out Now!</h4>

        {/* Side Wall Impact Button - below "Out Now!" - space always reserved */}
        <div className="mt-8 z-20 relative" style={{ minHeight: "40px" }}>
          {showSideWallButton && (
            <Button
              variant="secondary"
              size="lg"
              className="animate-[fadeIn_0.3s_ease-out] pointer-events-auto"
              onClick={() => {
                // Dispatch custom event to trigger RouteLoader animation
                window.dispatchEvent(
                  new CustomEvent("requestNavigation", {
                    detail: { href: "/a0ty" },
                  })
                );
              }}
            >
              Take me to the page
            </Button>
          )}
        </div>
      </div>

      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        {/* Instructions - centered at bottom */}
        {showInstructions && (
          <div className="absolute bottom-8 md:bottom-12 lg:bottom-16 left-1/2 -translate-x-1/2 z-10 text-white pointer-events-none px-4 text-center">
            <p className="body-text-sm text-muted">
              <span className="hidden md:inline">Drag and throw the cross to move it around.</span>
              <span className="md:hidden">Tap, drag and release the cross to throw it.</span>
            </p>
          </div>
        )}

        {/* Interactive Music Player (reacts to physics) */}
        <HomeInteractiveMusic audioSrc="/aoty-mode.m4a" autoPlay={true} isMuted={isMuted} />

        <Canvas
          gl={{
            alpha: true,
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
        >
          <PerspectiveCamera makeDefault position={CONFIG.camera.position} fov={CONFIG.camera.fov} />
          <Stats />
          {showCross && <SceneContent />}
        </Canvas>
      </div>
    </div>
  );
}
