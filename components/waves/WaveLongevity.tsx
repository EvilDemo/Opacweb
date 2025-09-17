import { motion } from "motion/react";

export function WaveLongevity() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 200"
      className="w-full h-full opacity-70"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M0 100 Q267 80 533 100 Q667 110 800 100"
        stroke="currentColor"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        animate={{
          d: [
            "M0 100 Q267 80 533 100 Q667 110 800 100",
            "M0 100 Q267 85 533 100 Q667 85 800 100",
            "M0 100 Q267 95 533 100 Q667 115 800 100",
            "M0 100 Q267 80 533 100 Q667 110 800 100",
          ],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.path
        d="M0 100 Q200 125 400 100 Q600 125 800 100"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          d: [
            "M0 100 Q200 125 400 100 Q600 125 800 100",
            "M0 100 Q200 115 400 100 Q600 115 800 100",
            "M0 100 Q200 135 400 100 Q600 135 800 100",
            "M0 100 Q200 125 400 100 Q600 125 800 100",
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />
      <motion.path
        d="M0 100 Q133 85 267 100 Q400 115 533 100 Q667 85 800 100"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        animate={{
          opacity: [0.15, 0.35, 0.15],
          d: [
            "M0 100 Q133 85 267 100 Q400 115 533 100 Q667 85 800 100",
            "M0 100 Q133 92 267 100 Q400 108 533 100 Q667 92 800 100",
            "M0 100 Q133 78 267 100 Q400 122 533 100 Q667 78 800 100",
            "M0 100 Q133 85 267 100 Q400 115 533 100 Q667 85 800 100",
          ],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 6,
        }}
      />
      <motion.g>
        {[200, 400, 600].map((x, i) => (
          <motion.circle
            key={i}
            cx={x}
            cy="100"
            r="3"
            fill="currentColor"
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [0.7, 1.3, 0.7],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2 + 4,
            }}
          />
        ))}
      </motion.g>
    </svg>
  );
}
