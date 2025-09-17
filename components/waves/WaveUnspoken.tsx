import { motion } from "motion/react";

export function WaveUnspoken() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 200"
      className="w-full h-full opacity-80"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M0 100 Q133 50 267 100 Q400 50 533 100 Q667 50 800 100"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: 1,
          opacity: [0, 0.8, 0.8, 0.4, 0.8],
        }}
        transition={{
          pathLength: { duration: 3, ease: "easeInOut" },
          opacity: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.2, 0.6, 0.8, 1],
          },
        }}
      />
      <motion.path
        d="M0 100 Q133 150 267 100 Q400 150 533 100 Q667 150 800 100"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: 1,
          opacity: [0, 0.4, 0.4, 0.15, 0.4],
        }}
        transition={{
          pathLength: { duration: 4, ease: "easeInOut", delay: 1 },
          opacity: {
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
            times: [0, 0.3, 0.7, 0.9, 1],
          },
        }}
      />
      <motion.path
        d="M0 100 Q100 80 200 100 Q300 120 400 100 Q500 80 600 100 Q700 120 800 100"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: 1,
          opacity: [0, 0.2, 0.2, 0.05, 0.2],
        }}
        transition={{
          pathLength: { duration: 5, ease: "easeInOut", delay: 2.5 },
          opacity: {
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
            times: [0, 0.25, 0.75, 0.95, 1],
          },
        }}
      />
    </svg>
  );
}
