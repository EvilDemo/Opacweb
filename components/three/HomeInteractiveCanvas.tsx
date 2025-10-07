"use client";

import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { Environment, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import type { RapierRigidBody } from "@react-three/rapier";
import type { ThreeEvent } from "@react-three/fiber";
import { HomeInteractiveMusic } from "./HomeInteractiveMusic";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Effect } from "postprocessing";
import { Uniform } from "three";
import { Button } from "@/components/ui/button";

// Custom Chromatic Aberration Shader
const chromaticAberrationShader = `
  uniform vec2 impactPoint;
  uniform float intensity;
  uniform vec2 resolution;

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Calculate distance from impact point
    vec2 center = impactPoint;
    float dist = distance(uv, center);
    
    // Create radial falloff
    float falloff = smoothstep(0.3, 0.0, dist);
    float aberration = intensity * falloff * 0.005;
    
    // Sample RGB channels with offset
    vec2 direction = normalize(uv - center);
    vec2 redOffset = direction * aberration * 0.8;
    vec2 greenOffset = direction * aberration * 0.3;
    vec2 blueOffset = direction * aberration * -0.5;
    
    float r = texture2D(inputBuffer, uv + redOffset).r;
    float g = texture2D(inputBuffer, uv + greenOffset).g;
    float b = texture2D(inputBuffer, uv + blueOffset).b;
    
    outputColor = vec4(r, g, b, inputColor.a);
  }
`;

// Custom Effect Class
class ChromaticRippleEffect extends Effect {
  constructor() {
    super("ChromaticRippleEffect", chromaticAberrationShader, {
      uniforms: new Map<string, Uniform>([
        ["impactPoint", new Uniform(new THREE.Vector2(0.5, 0.5))],
        ["intensity", new Uniform(0.0)],
        ["resolution", new Uniform(new THREE.Vector2(1, 1))],
      ]),
    });
  }
}

// Component to manage the chromatic ripple effect
function ChromaticRipple() {
  const effectRef = useRef<ChromaticRippleEffect>(null);
  const intensityRef = useRef(0);
  const impactPointRef = useRef(new THREE.Vector2(0.5, 0.5));
  const { size, camera } = useThree();

  useEffect(() => {
    const handleImpact = (event: CustomEvent) => {
      const { position } = event.detail;

      // Convert 3D position to screen space (normalized 0-1)
      const vec3 = new THREE.Vector3(position.x, position.y, position.z);
      vec3.project(camera);

      // Convert from NDC (-1 to 1) to UV (0 to 1)
      impactPointRef.current.set((vec3.x + 1) / 2, (vec3.y + 1) / 2);

      // Set initial intensity (stronger impacts = stronger effect)
      intensityRef.current = Math.min(event.detail.velocity * 0.08, 1.0);
    };

    window.addEventListener("wallImpact", handleImpact as EventListener);
    return () => {
      window.removeEventListener("wallImpact", handleImpact as EventListener);
    };
  }, [camera]);

  useFrame(() => {
    if (effectRef.current) {
      // Decay intensity over time
      intensityRef.current *= 0.92;

      // Update uniforms
      effectRef.current.uniforms.get("intensity")!.value = intensityRef.current;
      effectRef.current.uniforms.get("impactPoint")!.value = impactPointRef.current;
      effectRef.current.uniforms.get("resolution")!.value.set(size.width, size.height);
    }
  });

  return <primitive ref={effectRef} object={new ChromaticRippleEffect()} />;
}

// Interactive Cross Component
function InteractiveCross() {
  const { scene } = useGLTF("/cross.glb");
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const [isGrabbed, setIsGrabbed] = useState(false);
  const currentMousePos = useRef<THREE.Vector3>(new THREE.Vector3());
  const previousVelocity = useRef<THREE.Vector3>(new THREE.Vector3());
  const { camera } = useThree();

  // Check for collisions and emit glow pulse
  useFrame(() => {
    if (rigidBodyRef.current && !isGrabbed) {
      const velocity = rigidBodyRef.current.linvel();
      const currentVel = new THREE.Vector3(velocity.x, velocity.y, velocity.z);
      const velChange = currentVel.clone().sub(previousVelocity.current).length();

      // If velocity changed significantly, we hit something
      if (velChange > 3) {
        const pos = rigidBodyRef.current.translation();

        // Detect which wall was hit based on position
        const distance = 15;
        const fov = 60;
        const vFOV = (fov * Math.PI) / 180;
        const visibleHeight = 2 * Math.tan(vFOV / 2) * distance;
        const visibleWidth = visibleHeight * (window.innerWidth / window.innerHeight);
        const halfWidth = visibleWidth / 2;
        const halfHeight = visibleHeight / 2;
        const ceilingHeight = halfHeight * 0.5;

        let wallType: string | null = null;
        const threshold = 0.5; // Threshold to detect wall proximity

        if (Math.abs(pos.x - halfWidth) < threshold) {
          wallType = "right";
        } else if (Math.abs(pos.x + halfWidth) < threshold) {
          wallType = "left";
        } else if (Math.abs(pos.y + halfHeight) < threshold) {
          wallType = "floor";
        } else if (Math.abs(pos.y - ceilingHeight) < threshold) {
          wallType = "ceiling";
        }

        window.dispatchEvent(
          new CustomEvent("wallImpact", {
            detail: {
              position: { x: pos.x, y: pos.y, z: pos.z },
              velocity: currentVel.length(),
              wallType,
            },
          })
        );
      }

      previousVelocity.current.copy(currentVel);
    }
  });

  // Global pointer move handler
  useEffect(() => {
    if (!isGrabbed) return;

    const handleMove = (event: PointerEvent) => {
      if (rigidBodyRef.current) {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -(event.clientY / window.innerHeight) * 2 + 1;

        const mouse = new THREE.Vector2(x, y);
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersectPoint);

        // Calculate visible boundaries at Z=0
        const distance = 15;
        const fov = 60; // Updated FOV
        const vFOV = (fov * Math.PI) / 180;
        const visibleHeight = 2 * Math.tan(vFOV / 2) * distance;
        const visibleWidth = visibleHeight * (window.innerWidth / window.innerHeight);

        const maxX = visibleWidth / 2 - 1; // 1 unit padding from walls
        const maxYTop = (visibleHeight / 2) * 0.7 - 1; // Ceiling 70% of original height
        const maxYBottom = visibleHeight / 2 - 1; // Floor unchanged

        // Clamp position to boundaries (asymmetric for ceiling vs floor)
        intersectPoint.x = Math.max(-maxX, Math.min(maxX, intersectPoint.x));
        intersectPoint.y = Math.max(-maxYBottom, Math.min(maxYTop, intersectPoint.y));
        intersectPoint.z = 0;

        currentMousePos.current.copy(
          new THREE.Vector3(
            rigidBodyRef.current.translation().x,
            rigidBodyRef.current.translation().y,
            rigidBodyRef.current.translation().z
          )
        );

        rigidBodyRef.current.setTranslation(intersectPoint, true);
      }
    };

    const handleUp = () => {
      if (rigidBodyRef.current) {
        const currentPos = new THREE.Vector3(
          rigidBodyRef.current.translation().x,
          rigidBodyRef.current.translation().y,
          rigidBodyRef.current.translation().z
        );

        const velocity = currentPos.clone().sub(currentMousePos.current);
        const throwForce = velocity.multiplyScalar(50);

        rigidBodyRef.current.setLinvel({ x: throwForce.x, y: throwForce.y, z: 0 }, true);

        const torque = new THREE.Vector3(-throwForce.y * 0.3, throwForce.x * 0.3, throwForce.length() * 0.2);
        rigidBodyRef.current.setAngvel({ x: torque.x, y: torque.y, z: torque.z }, true);

        setIsGrabbed(false);

        // Emit release event for sound
        window.dispatchEvent(new CustomEvent("crossReleased"));
      }
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
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

      // Emit grab event for sound
      window.dispatchEvent(new CustomEvent("crossGrabbed"));
    }
  };

  // Clone and enhance the scene with metallic materials
  const clonedScene = scene.clone();

  clonedScene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material instanceof THREE.MeshStandardMaterial) {
        // Make it metallic and reflective
        child.material.metalness = 0.9;
        child.material.roughness = 0.1;
        child.material.envMapIntensity = 1.5;
        child.material.emissive = new THREE.Color(0x222222);
        child.material.emissiveIntensity = 0.2;
        child.material.needsUpdate = true;
      }
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={[0, 0, 0]}
      rotation={[Math.PI, 0, 0]}
      restitution={0.8}
      friction={0.1}
      colliders="hull"
      linearDamping={0.3}
      angularDamping={0.3}
      gravityScale={isGrabbed ? 0 : 1}
      lockTranslations={false}
      lockRotations={false}
    >
      <group onPointerDown={handlePointerDown}>
        <primitive object={clonedScene} scale={1} />
      </group>
    </RigidBody>
  );
}

// Preload the model
useGLTF.preload("/cross.glb");

// Boundary Walls Component
function BoundaryWalls() {
  const { size } = useThree();

  // Calculate visible area at Z=0 (where the cross is)
  // Camera is at Z=15, FOV is 60 degrees
  const distance = 15; // Camera Z position
  const fov = 60; // Field of view

  // Calculate the visible height at Z=0 using FOV
  const vFOV = (fov * Math.PI) / 180; // Convert to radians
  const visibleHeight = 2 * Math.tan(vFOV / 2) * distance;
  const visibleWidth = visibleHeight * (size.width / size.height); // Account for aspect ratio

  const halfWidth = visibleWidth / 2;
  const halfHeight = visibleHeight / 2;
  const ceilingHeight = halfHeight * 0.5; // Ceiling at 70% of full height
  const wallHeight = halfHeight + ceilingHeight; // Wall from floor to ceiling

  return (
    <>
      {/* Floor - bottom edge */}
      <RigidBody type="fixed" restitution={0.8} friction={0.5} colliders="cuboid">
        <mesh position={[0, -halfHeight, 0]}>
          <boxGeometry args={[visibleWidth + 2, 0.5, 10]} />
          <meshStandardMaterial visible={false} />
        </mesh>
      </RigidBody>

      {/* Ceiling - top edge (lowered) */}
      <RigidBody type="fixed" restitution={0.8} friction={0.5} colliders="cuboid">
        <mesh position={[0, ceilingHeight, 0]}>
          <boxGeometry args={[visibleWidth + 2, 0.5, 6]} />
          <meshStandardMaterial visible={false} />
        </mesh>
      </RigidBody>

      {/* Left wall (shorter) */}
      <RigidBody type="fixed" restitution={0.8} friction={0.5} colliders="cuboid">
        <mesh position={[-halfWidth, (-halfHeight + ceilingHeight) / 2, 0]}>
          <boxGeometry args={[0.5, wallHeight, 6]} />
          <meshStandardMaterial visible={false} />
        </mesh>
      </RigidBody>

      {/* Right wall (shorter) */}
      <RigidBody type="fixed" restitution={0.8} friction={0.5} colliders="cuboid">
        <mesh position={[halfWidth, (-halfHeight + ceilingHeight) / 2, 0]}>
          <boxGeometry args={[0.5, wallHeight, 6]} />
          <meshStandardMaterial visible={false} />
        </mesh>
      </RigidBody>

      {/* Back wall */}
      <RigidBody type="fixed" restitution={0.8} friction={0.5} colliders="cuboid">
        <mesh position={[0, (-halfHeight + ceilingHeight) / 2, -3]}>
          <boxGeometry args={[visibleWidth + 2, wallHeight, 0.5]} />
          <meshStandardMaterial visible={false} />
        </mesh>
      </RigidBody>

      {/* Front wall */}
      <RigidBody type="fixed" restitution={0.8} friction={0.5} colliders="cuboid">
        <mesh position={[0, (-halfHeight + ceilingHeight) / 2, 3]}>
          <boxGeometry args={[visibleWidth + 2, wallHeight, 0.5]} />
          <meshStandardMaterial visible={false} />
        </mesh>
      </RigidBody>
    </>
  );
}

// Scene Content
function SceneContent() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, 5, 5]} intensity={0.5} />

      {/* Environment */}
      <Environment preset="city" />

      {/* Physics World */}
      <Physics gravity={[0, -9.81, 0]}>
        <InteractiveCross />
        <BoundaryWalls />
      </Physics>

      {/* Post-Processing Effects */}
      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={0.15} luminanceSmoothing={0.9} mipmapBlur />
        <ChromaticRipple />
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

    // Show cross after text animation completes (1.5s duration + small delay)
    const crossTimer = setTimeout(() => {
      setShowCross(true);
    }, 1600);

    // Show instructions 1 second after cross appears
    const instructionsTimer = setTimeout(() => {
      setShowInstructions(true);
    }, 2600);

    return () => {
      clearTimeout(crossTimer);
      clearTimeout(instructionsTimer);
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

        // Set new timer to hide button after 10 seconds
        sideWallTimerRef.current = setTimeout(() => {
          setShowSideWallButton(false);
          sideWallTimerRef.current = null;
        }, 10000);
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
    <div className="w-full relative" style={{ height: "calc(100vh - 6rem)" }}>
      {/* Background Text Content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none z-10"
        style={{
          transform: animateText ? "perspective(1000px) translateZ(0px)" : "perspective(1000px) translateZ(-500px)",
          opacity: animateText ? 1 : 0,
          transition: "transform 1.5s ease-out, opacity 1.5s ease-out",
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
                // Add your button action here
                console.log("Take me to the page button clicked!");
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
          <div className="absolute bottom-8 md:bottom-12 lg:bottom-16 left-1/2 -translate-x-1/2 z-10 text-white pointer-events-none">
            <p className="body-text-sm text-muted">Drag and throw the cross to move it around.</p>
          </div>
        )}

        {/* Interactive Music Player (reacts to physics) */}
        <HomeInteractiveMusic audioSrc="/aoty-mode.mp4" autoPlay={showCross} isMuted={isMuted} />

        <Canvas shadows gl={{ alpha: true, antialias: true }}>
          <PerspectiveCamera makeDefault position={[0, -3, 17]} fov={50} />
          {showCross && <SceneContent />}
        </Canvas>
      </div>
    </div>
  );
}
