import { motion } from "motion/react";

export function WaveOpacity() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 200"
      className="w-full h-full opacity-70"
      preserveAspectRatio="xMidYMid meet"
    >
      <motion.path
        d="M0 100 Q80 40 160 100 Q240 160 320 100 Q400 40 480 100 Q560 160 640 100 Q720 40 800 100"
        stroke="currentColor"
        strokeWidth="3"
        className="[stroke-width:2.5] sm:[stroke-width:3] md:[stroke-width:4] lg:[stroke-width:5]"
        fill="none"
        strokeLinecap="round"
        animate={{
          d: [
            "M0 100 Q80 40 160 100 Q240 160 320 100 Q400 40 480 100 Q560 160 640 100 Q720 40 800 100",
            "M0 100 Q80 70 160 100 Q240 130 320 100 Q400 70 480 100 Q560 130 640 100 Q720 70 800 100",
            "M0 100 Q80 130 160 100 Q240 70 320 100 Q400 130 480 100 Q560 70 640 100 Q720 130 800 100",
            "M0 100 Q80 40 160 100 Q240 160 320 100 Q400 40 480 100 Q560 160 640 100 Q720 40 800 100",
          ],
          opacity: [0.4, 0.8, 0.5, 0.9, 0.4],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.path
        d="M0 100 Q100 70 200 100 Q300 130 400 100 Q500 70 600 100 Q700 130 800 100"
        stroke="currentColor"
        strokeWidth="1.5"
        className="[stroke-width:1.5] sm:[stroke-width:2] md:[stroke-width:2.5] lg:[stroke-width:3]"
        fill="none"
        strokeLinecap="round"
        animate={{
          d: [
            "M0 100 Q100 70 200 100 Q300 130 400 100 Q500 70 600 100 Q700 130 800 100",
            "M0 100 Q100 130 200 100 Q300 70 400 100 Q500 130 600 100 Q700 70 800 100",
            "M0 100 Q100 85 200 100 Q300 115 400 100 Q500 85 600 100 Q700 115 800 100",
            "M0 100 Q100 70 200 100 Q300 130 400 100 Q500 70 600 100 Q700 130 800 100",
          ],
          opacity: [0.25, 0.6, 0.35, 0.7, 0.25],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      />
      <motion.path
        d="M0 100 Q133 60 266 100 Q400 140 533 100 Q666 60 800 100"
        stroke="currentColor"
        strokeWidth="0.8"
        className="[stroke-width:0.8] sm:[stroke-width:1] md:[stroke-width:1.2] lg:[stroke-width:1.5]"
        fill="none"
        strokeLinecap="round"
        animate={{
          opacity: [0.1, 0.3, 0.15, 0.4, 0.1],
          d: [
            "M0 100 Q133 60 266 100 Q400 140 533 100 Q666 60 800 100",
            "M0 100 Q133 140 266 100 Q400 60 533 100 Q666 140 800 100",
            "M0 100 Q133 85 266 100 Q400 115 533 100 Q666 85 800 100",
            "M0 100 Q133 60 266 100 Q400 140 533 100 Q666 60 800 100",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />
    </svg>
  );
}
