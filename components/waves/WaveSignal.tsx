import { motion } from "motion/react";

export function WaveSignal() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 200"
      className="w-full h-full opacity-90"
      preserveAspectRatio="xMidYMid meet"
    >
      <motion.path
        d="M0 100 Q40 50 80 100 Q120 150 160 100 Q200 50 240 100 Q280 150 320 100 Q360 50 400 100 Q440 150 480 100 Q520 50 560 100 Q600 150 640 100 Q680 50 720 100 Q760 150 800 100"
        stroke="currentColor"
        strokeWidth="3"
        className="[stroke-width:2.5] sm:[stroke-width:3] md:[stroke-width:4] lg:[stroke-width:5]"
        fill="none"
        strokeLinecap="round"
        animate={{
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.path
        d="M0 100 Q27 70 53 100 Q80 130 107 100 Q133 70 160 100 Q187 130 213 100 Q240 70 267 100 Q293 130 320 100 Q347 70 373 100 Q400 130 427 100 Q453 70 480 100 Q507 130 533 100 Q560 70 587 100 Q613 130 640 100 Q667 70 693 100 Q720 130 747 100 Q773 70 800 100"
        stroke="currentColor"
        strokeWidth="1.5"
        className="[stroke-width:1.5] sm:[stroke-width:2] md:[stroke-width:2.5] lg:[stroke-width:3]"
        fill="none"
        strokeLinecap="round"
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "linear",
          delay: 1.2,
        }}
      />
      <motion.g>
        {Array.from({ length: 20 }, (_, i) => (
          <motion.line
            key={i}
            x1={40 + i * 38}
            y1="100"
            x2={40 + i * 38}
            y2="100"
            stroke="currentColor"
            strokeWidth="1"
            className="[stroke-width:1] sm:[stroke-width:1.2] md:[stroke-width:1.5] lg:[stroke-width:1.8]"
            animate={{
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.g>
      <motion.g>
        {[80, 160, 240, 320, 400, 480, 560, 640, 720].map((x, i) => (
          <motion.circle
            key={i}
            cx={x}
            cy="100"
            r="3"
            className="[r:2.5] sm:[r:3] md:[r:4] lg:[r:5]"
            fill="currentColor"
            animate={{
              scale: [0.5, 1.5, 0.5],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.g>
    </svg>
  );
}
