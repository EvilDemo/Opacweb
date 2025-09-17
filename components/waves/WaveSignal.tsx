import { motion } from "motion/react";

export function WaveSignal() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 200"
      className="w-full h-full opacity-90"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M0 100 Q40 50 80 100 Q120 150 160 100 Q200 50 240 100 Q280 150 320 100 Q360 50 400 100 Q440 150 480 100 Q520 50 560 100 Q600 150 640 100 Q680 50 720 100 Q760 150 800 100"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        animate={{
          d: [
            "M0 100 Q40 50 80 100 Q120 150 160 100 Q200 50 240 100 Q280 150 320 100 Q360 50 400 100 Q440 150 480 100 Q520 50 560 100 Q600 150 640 100 Q680 50 720 100 Q760 150 800 100",
            "M0 100 Q40 150 80 100 Q120 50 160 100 Q200 150 240 100 Q280 50 320 100 Q360 150 400 100 Q440 50 480 100 Q520 150 560 100 Q600 50 640 100 Q680 150 720 100 Q760 50 800 100",
            "M0 100 Q40 50 80 100 Q120 150 160 100 Q200 50 240 100 Q280 150 320 100 Q360 50 400 100 Q440 150 480 100 Q520 50 560 100 Q600 150 640 100 Q680 50 720 100 Q760 150 800 100",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.path
        d="M0 100 Q27 70 53 100 Q80 130 107 100 Q133 70 160 100 Q187 130 213 100 Q240 70 267 100 Q293 130 320 100 Q347 70 373 100 Q400 130 427 100 Q453 70 480 100 Q507 130 533 100 Q560 70 587 100 Q613 130 640 100 Q667 70 693 100 Q720 130 747 100 Q773 70 800 100"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        animate={{
          d: [
            "M0 100 Q27 70 53 100 Q80 130 107 100 Q133 70 160 100 Q187 130 213 100 Q240 70 267 100 Q293 130 320 100 Q347 70 373 100 Q400 130 427 100 Q453 70 480 100 Q507 130 533 100 Q560 70 587 100 Q613 130 640 100 Q667 70 693 100 Q720 130 747 100 Q773 70 800 100",
            "M0 100 Q27 130 53 100 Q80 70 107 100 Q133 130 160 100 Q187 70 213 100 Q240 130 267 100 Q293 70 320 100 Q347 130 373 100 Q400 70 427 100 Q453 130 480 100 Q507 70 533 100 Q560 130 587 100 Q613 70 640 100 Q667 130 693 100 Q720 70 747 100 Q773 130 800 100",
            "M0 100 Q27 70 53 100 Q80 130 107 100 Q133 70 160 100 Q187 130 213 100 Q240 70 267 100 Q293 130 320 100 Q347 70 373 100 Q400 130 427 100 Q453 70 480 100 Q507 130 533 100 Q560 70 587 100 Q613 130 640 100 Q667 70 693 100 Q720 130 747 100 Q773 70 800 100",
          ],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
          delay: 0.3,
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
            strokeWidth="1.5"
            animate={{
              y2: [100, 70, 130, 100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.05,
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
            r="4"
            fill="currentColor"
            animate={{
              scale: [0.5, 1.5, 0.5],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.g>
    </svg>
  );
}
