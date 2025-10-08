"use client";

import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Effect } from "postprocessing";
import { Uniform } from "three";
import * as THREE from "three";

/**
 * Configuration interface for the Chromatic Ripple Effect
 */
export interface ChromaticRippleConfig {
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
}

/**
 * Default configuration for chromatic aberration
 */
export const DEFAULT_CHROMATIC_CONFIG: ChromaticRippleConfig = {
  velocityIntensityMultiplier: 0.08,
  maxIntensity: 1.0,
  decayRate: 0.92,
  baseMultiplier: 0.005,
  falloffRange: [0.3, 0.0],
  channelOffsets: {
    red: 0.8,
    green: 0.3,
    blue: -0.5,
  },
};

/**
 * Creates the chromatic aberration shader with given configuration
 */
const createChromaticAberrationShader = (config: ChromaticRippleConfig) => `
  uniform vec2 impactPoint;
  uniform float intensity;
  uniform vec2 resolution;

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Calculate distance from impact point
    vec2 center = impactPoint;
    float dist = distance(uv, center);
    
    // Create radial falloff
    float falloff = smoothstep(${config.falloffRange[0].toFixed(1)}, ${config.falloffRange[1].toFixed(1)}, dist);
    float aberration = intensity * falloff * ${config.baseMultiplier.toFixed(4)};
    
    // Sample RGB channels with offset
    vec2 direction = normalize(uv - center);
    vec2 redOffset = direction * aberration * ${config.channelOffsets.red.toFixed(1)};
    vec2 greenOffset = direction * aberration * ${config.channelOffsets.green.toFixed(1)};
    vec2 blueOffset = direction * aberration * ${config.channelOffsets.blue.toFixed(1)};
    
    float r = texture2D(inputBuffer, uv + redOffset).r;
    float g = texture2D(inputBuffer, uv + greenOffset).g;
    float b = texture2D(inputBuffer, uv + blueOffset).b;
    
    outputColor = vec4(r, g, b, inputColor.a);
  }
`;

/**
 * Custom Effect Class for Chromatic Ripple
 */
class ChromaticRippleEffectImpl extends Effect {
  constructor(config: ChromaticRippleConfig) {
    super("ChromaticRippleEffect", createChromaticAberrationShader(config), {
      uniforms: new Map<string, Uniform>([
        ["impactPoint", new Uniform(new THREE.Vector2(0.5, 0.5))],
        ["intensity", new Uniform(0.0)],
        ["resolution", new Uniform(new THREE.Vector2(1, 1))],
      ]),
    });
  }
}

/**
 * Component to manage the chromatic ripple effect
 * Listens for 'wallImpact' custom events and creates visual distortion
 */
export function ChromaticRipple({ config }: { config?: Partial<ChromaticRippleConfig> }) {
  const effectRef = useRef<ChromaticRippleEffectImpl>(null);
  const intensityRef = useRef(0);
  const impactPointRef = useRef(new THREE.Vector2(0.5, 0.5));
  const { size, camera } = useThree();

  // Merge provided config with defaults
  const finalConfig = { ...DEFAULT_CHROMATIC_CONFIG, ...config };

  useEffect(() => {
    const handleImpact = (event: CustomEvent) => {
      const { position } = event.detail;

      // Convert 3D position to screen space (normalized 0-1)
      const vec3 = new THREE.Vector3(position.x, position.y, position.z);
      vec3.project(camera);

      // Convert from NDC (-1 to 1) to UV (0 to 1)
      impactPointRef.current.set((vec3.x + 1) / 2, (vec3.y + 1) / 2);

      // Set initial intensity (stronger impacts = stronger effect)
      intensityRef.current = Math.min(
        event.detail.velocity * finalConfig.velocityIntensityMultiplier,
        finalConfig.maxIntensity
      );
    };

    window.addEventListener("wallImpact", handleImpact as EventListener);
    return () => {
      window.removeEventListener("wallImpact", handleImpact as EventListener);
    };
  }, [camera, finalConfig]);

  useFrame(() => {
    if (effectRef.current) {
      // Decay intensity over time
      intensityRef.current *= finalConfig.decayRate;

      // Update uniforms
      effectRef.current.uniforms.get("intensity")!.value = intensityRef.current;
      effectRef.current.uniforms.get("impactPoint")!.value = impactPointRef.current;
      effectRef.current.uniforms.get("resolution")!.value.set(size.width, size.height);
    }
  });

  return <primitive ref={effectRef} object={new ChromaticRippleEffectImpl(finalConfig)} />;
}
