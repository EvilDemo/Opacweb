import { motion } from "motion/react";

export function WaveLongevity() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 200"
      className="w-full h-full opacity-70"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Main steady baseline - represents longevity/permanence */}
      <motion.path
        d="M0 100 L800 100"
        stroke="currentColor"
        strokeWidth="4"
        className="[stroke-width:3] sm:[stroke-width:4] md:[stroke-width:5] lg:[stroke-width:6]"
        fill="none"
        strokeLinecap="round"
        animate={{
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Gentle waves above - representing growth over time */}
      <motion.path
        d="M0 100 Q200 80 400 100 Q600 80 800 100"
        stroke="currentColor"
        strokeWidth="2"
        className="[stroke-width:2] sm:[stroke-width:2.5] md:[stroke-width:3] lg:[stroke-width:3.5]"
        fill="none"
        strokeLinecap="round"
        animate={{
          opacity: [0.3, 0.7, 0.3],
          d: [
            "M0 100 Q200 80 400 100 Q600 80 800 100",
            "M0 100 Q200 75 400 100 Q600 75 800 100",
            "M0 100 Q200 85 400 100 Q600 85 800 100",
            "M0 100 Q200 80 400 100 Q600 80 800 100",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Subtle waves below - representing depth/foundation */}
      <motion.path
        d="M0 100 Q200 120 400 100 Q600 120 800 100"
        stroke="currentColor"
        strokeWidth="1"
        className="[stroke-width:1] sm:[stroke-width:1.2] md:[stroke-width:1.5] lg:[stroke-width:1.8]"
        fill="none"
        strokeLinecap="round"
        animate={{
          opacity: [0.2, 0.4, 0.2],
          d: [
            "M0 100 Q200 120 400 100 Q600 120 800 100",
            "M0 100 Q200 125 400 100 Q600 125 800 100",
            "M0 100 Q200 115 400 100 Q600 115 800 100",
            "M0 100 Q200 120 400 100 Q600 120 800 100",
          ],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Milestone markers - representing chapters/moments */}
      <motion.g>
        {[133, 267, 400, 533, 667].map((x, i) => (
          <motion.circle
            key={i}
            cx={x}
            cy="100"
            r="2.5"
            className="[r:2] sm:[r:2.5] md:[r:3] lg:[r:3.5]"
            fill="currentColor"
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.2,
            }}
          />
        ))}
      </motion.g>
    </svg>
  );
}
