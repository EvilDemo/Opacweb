"use client";

import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { Environment, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { useRef, useState, useEffect, useMemo } from "react";
import * as THREE from "three";
import type { RapierRigidBody } from "@react-three/rapier";
import type { ThreeEvent } from "@react-three/fiber";
import { HomeInteractiveMusic } from "./HomeInteractiveMusic";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Button } from "@/components/ui/button";
import { ChromaticRipple } from "./effects/ChromaticRippleEffect";

/**
 * Configuration interface for the Interactive Canvas
 */
interface InteractiveCanvasConfig {
  camera: {
    /** Camera position [x, y, z] */
    position: [number, number, number];
    /** Field of view in degrees */
    fov: number;
    /** Distance used for boundary calculations (camera Z position) */
    boundaryDistance: number;
  };
  physics: {
    /** Gravity vector [x, y, z] */
    gravity: [number, number, number];
    cross: {
      /** Bounciness of the cross (0-1) */
      restitution: number;
      /** Surface friction (0-1) */
      friction: number;
      /** Linear velocity damping (0-1) */
      linearDamping: number;
      /** Angular velocity damping (0-1) */
      angularDamping: number;
      /** Initial rotation [x, y, z] in radians */
      initialRotation: [number, number, number];
      /** Scale multiplier */
      scale: number;
    };
    walls: {
      /** Bounciness of walls (0-1) */
      restitution: number;
      /** Depth of front/back walls */
      depth: number;
    };
    interaction: {
      /** Force multiplier when throwing the cross */
      throwForceMultiplier: number;
      /** Torque multipliers [x, y, z] */
      torqueMultipliers: [number, number, number];
    };
  };
  materials: {
    cross: {
      /** Metallic appearance (0-1) */
      metalness: number;
      /** Surface roughness (0-1) */
      roughness: number;
      /** Environment map intensity */
      envMapIntensity: number;
      /** Emissive color (hex) */
      emissiveColor: number;
      /** Emissive intensity */
      emissiveIntensity: number;
    };
  };
  effects: {
    chromaticAberration: {
      /** Intensity multiplier based on velocity */
      velocityIntensityMultiplier: number;
      /** Maximum intensity cap */
      maxIntensity: number;
      /** Decay rate per frame (0-1) */
      decayRate: number;
      /** Base aberration multiplier */
      baseMultiplier: number;
      /** Falloff smoothstep range [max, min] */
      falloffRange: [number, number];
      /** RGB channel offsets */
      channelOffsets: {
        red: number;
        green: number;
        blue: number;
      };
    };
    bloom: {
      /** Overall bloom intensity */
      intensity: number;
      /** Luminance threshold for bloom */
      luminanceThreshold: number;
      /** Luminance smoothing */
      luminanceSmoothing: number;
    };
  };
  lighting: {
    ambient: {
      /** Ambient light intensity */
      intensity: number;
    };
    directional: {
      /** Directional light position [x, y, z] */
      position: [number, number, number];
      /** Light intensity */
      intensity: number;
    };
  };
  boundary: {
    /** Ceiling height as multiplier of full height */
    ceilingHeightMultiplier: number;
    /** Padding from viewport edges */
    padding: number;
    /** Minimum velocity change to register impact */
    velocityChangeThreshold: number;
    /** Velocity below which object "sleeps" on floor */
    sleepVelocityThreshold: number;
  };
  timing: {
    /** Delay before cross appears (ms) */
    crossAppearDelay: number;
    /** Delay before instructions appear (ms) */
    instructionsAppearDelay: number;
    /** Text animation duration (seconds) */
    textAnimationDuration: number;
    /** Side wall button visibility duration (ms) */
    sideWallButtonDuration: number;
  };
  animation: {
    /** Initial Z depth for text animation */
    textInitialDepth: string;
    /** Final Z depth for text animation */
    textFinalDepth: string;
  };
}

/**
 * Centralized configuration for all Interactive Canvas parameters
 */
const CONFIG: InteractiveCanvasConfig = {
  camera: {
    position: [0, -3, 17],
    fov: 50,
    boundaryDistance: 15,
  },
  physics: {
    gravity: [0, -9.81, 0],
    cross: {
      restitution: 0.4,
      friction: 0.1,
      linearDamping: 0.5,
      angularDamping: 0.3,
      initialRotation: [Math.PI, 0, 0],
      scale: 1,
    },
    walls: {
      restitution: 0.4,
      depth: 7,
    },
    interaction: {
      throwForceMultiplier: 50,
      torqueMultipliers: [0.3, 0.3, 0.2],
    },
  },
  materials: {
    cross: {
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1.5,
      emissiveColor: 0x222222,
      emissiveIntensity: 0.2,
    },
  },
  effects: {
    chromaticAberration: {
      velocityIntensityMultiplier: 0.04,
      maxIntensity: 0.5,
      decayRate: 0.95,
      baseMultiplier: 0.003,
      falloffRange: [0.3, 0.0],
      channelOffsets: {
        red: 0.5,
        green: 0.2,
        blue: -0.3,
      },
    },
    bloom: {
      intensity: 0.3,
      luminanceThreshold: 0.25,
      luminanceSmoothing: 0.9,
    },
  },
  lighting: {
    ambient: {
      intensity: 0.5,
    },
    directional: {
      position: [5, 5, 5],
      intensity: 1,
    },
  },
  boundary: {
    ceilingHeightMultiplier: 0.5,
    padding: 1,
    velocityChangeThreshold: 6,
    sleepVelocityThreshold: 0.5, // Velocity below which object "sleeps" on floor
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

/**
 * Calculate viewport boundaries based on camera settings and aspect ratio
 */
function calculateViewportBounds(camera: { boundaryDistance: number; fov: number }, aspectRatio: number) {
  const distance = camera.boundaryDistance;
  const vFOV = (camera.fov * Math.PI) / 180;
  const visibleHeight = 2 * Math.tan(vFOV / 2) * distance;
  const visibleWidth = visibleHeight * aspectRatio;

  return {
    halfWidth: visibleWidth / 2,
    halfHeight: visibleHeight / 2,
    visibleWidth,
    visibleHeight,
  };
}

// Interactive Cross Component
function InteractiveCross() {
  const { scene } = useGLTF("/cross.glb");
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const [isGrabbed, setIsGrabbed] = useState(false);
  const currentMousePos = useRef<THREE.Vector3>(new THREE.Vector3());
  const boundsRef = useRef({ maxX: 0, maxYTop: 0, maxYBottom: 0 });
  const lastImpactTime = useRef(0);
  const { camera, size } = useThree();

  // Calculate bounds with useMemo
  const bounds = useMemo(
    () => calculateViewportBounds(CONFIG.camera, size.width / size.height),
    [size.width, size.height]
  );

  // Update boundsRef with useEffect
  useEffect(() => {
    boundsRef.current = {
      maxX: bounds.halfWidth - CONFIG.boundary.padding,
      maxYTop: bounds.halfHeight * CONFIG.boundary.ceilingHeightMultiplier - CONFIG.boundary.padding,
      maxYBottom: bounds.halfHeight - CONFIG.boundary.padding,
    };
  }, [bounds]);

  // Manual position clamping with bounce using useFrame
  useFrame(() => {
    if (!rigidBodyRef.current || isGrabbed) return;

    const pos = rigidBodyRef.current.translation();
    const vel = rigidBodyRef.current.linvel();
    let newPos = { x: pos.x, y: pos.y, z: pos.z };
    let newVel = { x: vel.x, y: vel.y, z: vel.z };
    let positionChanged = false;
    let velocityChanged = false;

    // Check X axis boundaries
    if (pos.x < -boundsRef.current.maxX) {
      newPos.x = -boundsRef.current.maxX;
      newVel.x = -vel.x * CONFIG.physics.walls.restitution;
      positionChanged = true;
      velocityChanged = true;

      const speed = Math.abs(vel.x);
      if (speed > CONFIG.boundary.velocityChangeThreshold && Date.now() - lastImpactTime.current > 100) {
        lastImpactTime.current = Date.now();
        window.dispatchEvent(
          new CustomEvent("wallImpact", {
            detail: {
              position: { x: newPos.x, y: newPos.y, z: newPos.z },
              velocity: speed,
              wallType: "left",
            },
          })
        );
      }
    } else if (pos.x > boundsRef.current.maxX) {
      newPos.x = boundsRef.current.maxX;
      newVel.x = -vel.x * CONFIG.physics.walls.restitution;
      positionChanged = true;
      velocityChanged = true;

      const speed = Math.abs(vel.x);
      if (speed > CONFIG.boundary.velocityChangeThreshold && Date.now() - lastImpactTime.current > 100) {
        lastImpactTime.current = Date.now();
        window.dispatchEvent(
          new CustomEvent("wallImpact", {
            detail: {
              position: { x: newPos.x, y: newPos.y, z: newPos.z },
              velocity: speed,
              wallType: "right",
            },
          })
        );
      }
    }

    // Check Y axis boundaries
    if (pos.y < -boundsRef.current.maxYBottom) {
      newPos.y = -boundsRef.current.maxYBottom;

      const speed = Math.abs(vel.y);
      // If moving slowly on floor, stop completely (sleep)
      if (speed < CONFIG.boundary.sleepVelocityThreshold) {
        newVel.y = 0;
        newVel.x *= 0.8; // Also dampen horizontal movement when sleeping
        newVel.z *= 0.8;
      } else {
        newVel.y = -vel.y * CONFIG.physics.walls.restitution;
      }

      positionChanged = true;
      velocityChanged = true;

      if (speed > CONFIG.boundary.velocityChangeThreshold && Date.now() - lastImpactTime.current > 100) {
        lastImpactTime.current = Date.now();
        window.dispatchEvent(
          new CustomEvent("wallImpact", {
            detail: {
              position: { x: newPos.x, y: newPos.y, z: newPos.z },
              velocity: speed,
              wallType: "floor",
            },
          })
        );
      }
    } else if (pos.y > boundsRef.current.maxYTop) {
      newPos.y = boundsRef.current.maxYTop;
      newVel.y = -vel.y * CONFIG.physics.walls.restitution;
      positionChanged = true;
      velocityChanged = true;

      const speed = Math.abs(vel.y);
      if (speed > CONFIG.boundary.velocityChangeThreshold && Date.now() - lastImpactTime.current > 100) {
        lastImpactTime.current = Date.now();
        window.dispatchEvent(
          new CustomEvent("wallImpact", {
            detail: {
              position: { x: newPos.x, y: newPos.y, z: newPos.z },
              velocity: speed,
              wallType: "ceiling",
            },
          })
        );
      }
    }

    // Check Z axis boundaries
    if (pos.z < -CONFIG.physics.walls.depth) {
      newPos.z = -CONFIG.physics.walls.depth;
      newVel.z = -vel.z * CONFIG.physics.walls.restitution;
      positionChanged = true;
      velocityChanged = true;

      const speed = Math.abs(vel.z);
      if (speed > CONFIG.boundary.velocityChangeThreshold && Date.now() - lastImpactTime.current > 100) {
        lastImpactTime.current = Date.now();
        window.dispatchEvent(
          new CustomEvent("wallImpact", {
            detail: {
              position: { x: newPos.x, y: newPos.y, z: newPos.z },
              velocity: speed,
              wallType: "back",
            },
          })
        );
      }
    } else if (pos.z > CONFIG.physics.walls.depth) {
      newPos.z = CONFIG.physics.walls.depth;
      newVel.z = -vel.z * CONFIG.physics.walls.restitution;
      positionChanged = true;
      velocityChanged = true;

      const speed = Math.abs(vel.z);
      if (speed > CONFIG.boundary.velocityChangeThreshold && Date.now() - lastImpactTime.current > 100) {
        lastImpactTime.current = Date.now();
        window.dispatchEvent(
          new CustomEvent("wallImpact", {
            detail: {
              position: { x: newPos.x, y: newPos.y, z: newPos.z },
              velocity: speed,
              wallType: "front",
            },
          })
        );
      }
    }

    // Apply changes if needed
    if (positionChanged) {
      rigidBodyRef.current.setTranslation(newPos, true);
    }
    if (velocityChanged) {
      rigidBodyRef.current.setLinvel(newVel, true);
    }
  });

  // Global pointer move handler
  useEffect(() => {
    if (!isGrabbed) return;

    const handleMove = (event: PointerEvent) => {
      // Prevent default touch behaviors during drag
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

        // Clamp position to boundaries using cached values
        intersectPoint.x = Math.max(-boundsRef.current.maxX, Math.min(boundsRef.current.maxX, intersectPoint.x));
        intersectPoint.y = Math.max(
          -boundsRef.current.maxYBottom,
          Math.min(boundsRef.current.maxYTop, intersectPoint.y)
        );
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

    // Use passive: false to allow preventDefault() for touch events
    window.addEventListener("pointermove", handleMove, { passive: false });
    window.addEventListener("pointerup", handleRelease);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleRelease);
    };
  }, [isGrabbed, camera]);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    // Note: preventDefault not needed here - parent div has touchAction: "none"

    if (rigidBodyRef.current) {
      // Freeze the cross
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);

      // Store current position
      const pos = rigidBodyRef.current.translation();
      currentMousePos.current.set(pos.x, pos.y, pos.z);

      // Calculate and cache boundaries for dragging
      const bounds = calculateViewportBounds(CONFIG.camera, window.innerWidth / window.innerHeight);
      boundsRef.current = {
        maxX: bounds.halfWidth - CONFIG.boundary.padding,
        maxYTop: bounds.halfHeight * CONFIG.boundary.ceilingHeightMultiplier - CONFIG.boundary.padding,
        maxYBottom: bounds.halfHeight - CONFIG.boundary.padding,
      };

      setIsGrabbed(true);
    }
  };

  // Modify the cached scene once on mount
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        if (child.material instanceof THREE.MeshStandardMaterial) {
          // Make it metallic and reflective
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
      lockTranslations={false}
      lockRotations={false}
      enabledTranslations={[true, true, false]}
      ccd={true}
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

      {/* Environment - simplified for performance */}
      <Environment preset="sunset" resolution={256} />

      {/* Physics World */}
      <Physics gravity={CONFIG.physics.gravity}>
        <InteractiveCross />
      </Physics>

      {/* Post-Processing Effects */}
      <EffectComposer>
        <Bloom
          intensity={CONFIG.effects.bloom.intensity}
          luminanceThreshold={CONFIG.effects.bloom.luminanceThreshold}
          luminanceSmoothing={CONFIG.effects.bloom.luminanceSmoothing}
        />
        <ChromaticRipple config={CONFIG.effects.chromaticAberration} />
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

      // Only show button for side walls (left or right)
      if (wallType === "left" || wallType === "right") {
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
        touchAction: "none", // Prevent all browser touch gestures
        WebkitUserSelect: "none", // Prevent text selection on touch
        userSelect: "none",
      }}
    >
      {/* Background Text Content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none z-10"
        style={{
          transform: animateText
            ? `perspective(1000px) translateZ(${CONFIG.animation.textFinalDepth})`
            : `perspective(1000px) translateZ(${CONFIG.animation.textInitialDepth})`,
          opacity: animateText ? 1 : 0,
          transition: `transform ${CONFIG.timing.textAnimationDuration}s ease-out, opacity ${CONFIG.timing.textAnimationDuration}s ease-out`,
        }}
      >
        <h1 className=" display-text font-bold mb-4">A0TY</h1>
        <h4 className="heading-4  lg:heading-3 xl:heading-2">Out Now!</h4>

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
            antialias: true,
            powerPreference: "high-performance",
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false,
          }}
          dpr={[1, 2]}
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
