"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";
import { Environment, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import type { RapierRigidBody } from "@react-three/rapier";
import type { ThreeEvent } from "@react-three/fiber";
import { HomeInteractiveMusic } from "./HomeInteractiveMusic";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
      throwForceMultiplier: 25, // Reduced force for gentler interaction
      mobileThrowForceMultiplier: 30, // Reduced force for mobile - gentler interaction
      torqueMultipliers: [0.15, 0.15, 0.1] as [number, number, number], // Reduced torque for gentler rotation
    },
  },
  boundaries: {
    width: 32, // Wider to cover full viewport width
    height: 20, // Taller to ensure floor catches everything
    depth: 14,
    ceilingHeightMultiplier: 0.5,
    // Mobile-specific boundaries
    mobileWidth: 12, // Much narrower for mobile viewport
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
  timing: {
    crossAppearDelay: 1600,
    instructionsAppearDelay: 2600,
    textAnimationDuration: 1.5,
  },
  animation: {
    textInitialDepth: "-500px",
    textFinalDepth: "0px",
  },
};

// Invisible Walls Component
function BoundaryWalls() {
  const { width, height, depth, ceilingHeightMultiplier, mobileWidth } = CONFIG.boundaries;
  const { thickness, restitution } = CONFIG.physics.walls;

  // Use responsive width - smaller on mobile
  const effectiveWidth = typeof window !== "undefined" && window.innerWidth < 768 ? mobileWidth : width;
  const ceilingHeight = (height / 2) * ceilingHeightMultiplier;
  const wallHeight = height * 1.5; // Make walls taller to ensure they catch everything

  const handleWallCollision = (wallType: string, position: { x: number; y: number; z: number }) => {
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
        position={[-effectiveWidth / 2, -3, 0]}
        args={[thickness / 2, wallHeight / 2, depth / 2]}
        restitution={restitution}
        friction={0.1}
        onCollisionEnter={() => handleWallCollision("left", { x: -effectiveWidth / 2, y: -3, z: 0 })}
      />

      {/* Right Wall */}
      <CuboidCollider
        position={[effectiveWidth / 2, -3, 0]}
        args={[thickness / 2, wallHeight / 2, depth / 2]}
        restitution={restitution}
        friction={0.1}
        onCollisionEnter={() => handleWallCollision("right", { x: effectiveWidth / 2, y: -3, z: 0 })}
      />

      {/* Floor */}
      <CuboidCollider
        position={[0, -8, 0]}
        args={[effectiveWidth, thickness / 2, depth]}
        restitution={restitution}
        friction={0.1}
        onCollisionEnter={() => handleWallCollision("floor", { x: 0, y: -8, z: 0 })}
      />

      {/* Ceiling */}
      <CuboidCollider
        position={[0, ceilingHeight, 0]}
        args={[effectiveWidth / 2, thickness / 2, depth / 2]}
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
  const { camera } = useThree();

  // Global pointer move handler - only for desktop drag
  useEffect(() => {
    if (!isGrabbed) return;

    // Check if we're on mobile - if so, don't attach global listeners
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    if (isMobile) return;

    const handleMove = (event: PointerEvent) => {
      // Only prevent default when we're actively dragging to allow normal scrolling
      if (isGrabbed) {
        event.preventDefault();
      }

      if (rigidBodyRef.current) {
        const clientX = event.clientX;
        const clientY = event.clientY;

        const x = (clientX / window.innerWidth) * 2 - 1;
        const y = -(clientY / window.innerHeight) * 2 + 1;

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
      if (rigidBodyRef.current && isGrabbed) {
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

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleRelease);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleRelease);
    };
  }, [isGrabbed, camera]);

  // Mobile tap interaction - tap anywhere on screen to throw cross
  useEffect(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    if (!isMobile) return;

    const handleMobileTap = (event: TouchEvent) => {
      // Only handle if we're not already grabbed and on mobile
      if (isGrabbed || !rigidBodyRef.current) return;

      // Check if hero section is in view
      const heroSection = document.querySelector("section");
      if (!heroSection) return;

      const rect = heroSection.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!isInView) return;

      event.preventDefault();

      // Apply stronger random throw force on tap
      const randomForce = {
        x: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 15 + 5), // Random left or right with strong force (5 to 20)
        y: Math.random() * 8 + 4, // Stronger upward force (4 to 12)
        z: 0,
      };

      // Apply the force
      rigidBodyRef.current.setLinvel(randomForce, true);

      // Add stronger random rotation
      const randomTorque = {
        x: (Math.random() - 0.5) * 2, // Stronger rotation (-1 to +1)
        y: (Math.random() - 0.5) * 2, // Stronger rotation (-1 to +1)
        z: (Math.random() - 0.5) * 1.5, // Stronger rotation (-0.75 to +0.75)
      };
      rigidBodyRef.current.setAngvel(randomTorque, true);
    };

    window.addEventListener("touchstart", handleMobileTap, { passive: false });

    return () => {
      window.removeEventListener("touchstart", handleMobileTap);
    };
  }, [isGrabbed]);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    // Only handle on desktop
    if (window.innerWidth < 768) return;

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
      <Environment preset="studio" resolution={128} />

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

// AOTY Album Card Component
function AotyAlbumCard() {
  const cardClasses = "w-full flex flex-col";
  const headerClasses = "flex-1 flex flex-col min-h-0 pt-3";
  const titleClasses = "body-text-sm-md line-clamp-1 leading-tight";
  const contentClasses = "pb-1 pt-3";

  return (
    <Card variant="media" background="media" className={cardClasses}>
      <div className="aspect-[3/2] overflow-hidden -m-6 mb-0 rounded-t-xl relative">
        <Image
          src="/aoty-mode-card.webp"
          alt="AOTY - Album of the Year"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 320px, 384px"
          priority
        />
      </div>
      <CardHeader className={headerClasses}>
        <CardTitle className={titleClasses} title="AOTY">
          AOTY <span className="text-muted body-text-xs">Album of the Year</span>
        </CardTitle>
        <CardDescription title="Album of the Year - Explore our latest music collection">
          <p
            className="body-text-xs text-muted text-start text-wrap"
            style={{ minHeight: "calc(1em * var(--line-height-normal) * 3)" }}
          >
            Joya&apos;s debut project explores introspection, loss, and rebellion through a fusion of rap, electronic,
            and psychedelic rock sounds.
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className={contentClasses}>
        <Link href="/a0ty" aria-label="Visit AOTY album page">
          <Button variant="secondary" size="sm" className="w-full">
            <ExternalLink className="mr-2 h-3 w-3" />
            View Release
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Main Component
export function HomeInteractiveCanvas({ isMuted = false }: { isMuted?: boolean }) {
  const [showCross, setShowCross] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Detect mobile screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkMobile();

    // Listen for resize events
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    // Show cross after text animation completes
    const crossTimer = setTimeout(() => {
      setShowCross(true);
    }, CONFIG.timing.crossAppearDelay);

    // Show instructions after cross appears
    const instructionsTimer = setTimeout(() => {
      setShowInstructions(true);
    }, CONFIG.timing.instructionsAppearDelay);

    return () => {
      clearTimeout(crossTimer);
      clearTimeout(instructionsTimer);
    };
  }, []);

  // Listen for wall impacts
  useEffect(() => {
    const handleWallImpact = (event: CustomEvent) => {
      const { wallType } = event.detail;

      // Only show button for side walls (left or right)
      if (wallType === "left" || wallType === "right") {
        // Clear any existing timer
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        setShowButton(true);

        // Hide button after 10 seconds
        timerRef.current = setTimeout(() => {
          setShowButton(false);
          timerRef.current = null;
        }, 10000);
      }
    };

    window.addEventListener("wallImpact", handleWallImpact as EventListener);

    return () => {
      window.removeEventListener("wallImpact", handleWallImpact as EventListener);
      // Clean up timer on unmount
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div
      className="w-full relative"
      style={{
        height: "calc(100vh - 6rem)",
        touchAction: isMobile ? "pan-y" : "none", // Allow vertical scrolling on mobile
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none", // Disable iOS callout menu
      }}
    >
      {/* AOTY Album Card - Centered */}
      {showButton && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none padding-global -translate-y-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="pointer-events-auto w-full max-w-[200px] md:max-w-[240px] lg:max-w-[320px]">
            <AotyAlbumCard />
          </div>
        </motion.div>
      )}

      {/* Instructions - Bottom */}
      <motion.div
        className={`absolute ${
          isMobile ? "bottom-22" : "bottom-8 md:bottom-9 lg:bottom-10"
        } left-0 right-0 flex flex-col items-center z-30 pointer-events-none padding-global`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          delay: 1.0,
        }}
      >
        {showInstructions && (
          <p className="text-white text-center">
            <span className="hidden md:inline body-text-sm text-muted">
              Drag and throw the cross to move it around.
            </span>
            <span className="md:hidden body-text-sm text-muted">Tap the cross to throw it around.</span>
          </p>
        )}
      </motion.div>

      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        {/* Interactive Music Player (reacts to physics) */}
        <HomeInteractiveMusic audioSrc="/aoty-mode-home.m4a" autoPlay={true} isMuted={isMuted} />

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
          {showCross && <SceneContent />}
        </Canvas>
      </div>
    </div>
  );
}
