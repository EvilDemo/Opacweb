"use client";

interface InlineSphereLoaderProps {
  label?: string;
}

const sphereVideo = "/esfera3D_optimized.webm";

export function InlineSphereLoader({ label = "Loading A0TY experience" }: InlineSphereLoaderProps) {
  return (
    <div
      className="flex h-full min-h-[420px] w-full items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="relative h-28 w-28 overflow-hidden rounded-full sm:h-36 sm:w-36 md:h-44 md:w-44">
        <video src={sphereVideo} autoPlay loop muted playsInline className="h-full w-full object-contain" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
