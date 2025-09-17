import { motion } from "motion/react";

export function WaveRitual() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 200"
      className="w-full h-full opacity-75"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M0 100 Q67 60 134 100 Q200 140 267 100 Q334 60 400 100 Q467 140 534 100 Q600 60 667 100 Q734 140 800 100"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        animate={{
          d: [
            "M0 100 Q67 60 134 100 Q200 140 267 100 Q334 60 400 100 Q467 140 534 100 Q600 60 667 100 Q734 140 800 100",
            "M0 100 Q67 140 134 100 Q200 60 267 100 Q334 140 400 100 Q467 60 534 100 Q600 140 667 100 Q734 60 800 100",
            "M0 100 Q67 60 134 100 Q200 140 267 100 Q334 60 400 100 Q467 140 534 100 Q600 60 667 100 Q734 140 800 100",
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.path
        d="M0 100 Q100 70 200 100 Q300 130 400 100 Q500 70 600 100 Q700 130 800 100"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        animate={{
          d: [
            "M0 100 Q100 70 200 100 Q300 130 400 100 Q500 70 600 100 Q700 130 800 100",
            "M0 100 Q100 130 200 100 Q300 70 400 100 Q500 130 600 100 Q700 70 800 100",
            "M0 100 Q100 70 200 100 Q300 130 400 100 Q500 70 600 100 Q700 130 800 100",
          ],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.g>
        {[134, 267, 400, 534, 667].map((x, i) => (
          <motion.circle
            key={i}
            cx={x}
            cy="100"
            r="5"
            fill="currentColor"
            animate={{
              cy: [100, 65, 135, 100],
              opacity: [0.4, 0.9, 0.4],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </motion.g>
      <motion.g>
        {[67, 200, 334, 467, 600, 734].map((x, i) => (
          <motion.circle
            key={i}
            cx={x}
            cy="100"
            r="3"
            fill="currentColor"
            animate={{
              cy: [100, 80, 120, 100],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4 + 1.5,
            }}
          />
        ))}
      </motion.g>
    </svg>
  );
}
