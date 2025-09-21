import { motion } from "motion/react";

export function WaveUnspoken() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 200"
      className="w-full h-full opacity-80"
      preserveAspectRatio="xMidYMid meet"
    >
      <motion.path
        d="M0 100 Q133 50 267 100 Q400 50 533 100 Q667 50 800 100"
        stroke="currentColor"
        strokeWidth="2.5"
        className="[stroke-width:2] sm:[stroke-width:2.5] md:[stroke-width:3] lg:[stroke-width:4]"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: 1,
          opacity: [0.2, 0.9, 0.3, 0.8, 0.1, 0.9],
          d: [
            "M0 100 Q133 50 267 100 Q400 50 533 100 Q667 50 800 100",
            "M0 100 Q133 45 267 100 Q400 45 533 100 Q667 45 800 100",
            "M0 100 Q133 55 267 100 Q400 55 533 100 Q667 55 800 100",
            "M0 100 Q133 50 267 100 Q400 50 533 100 Q667 50 800 100",
          ],
        }}
        transition={{
          pathLength: { duration: 3, ease: "easeInOut" },
          opacity: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.15, 0.4, 0.6, 0.85, 1],
          },
          d: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      />
      <motion.path
        d="M0 100 Q133 150 267 100 Q400 150 533 100 Q667 150 800 100"
        stroke="currentColor"
        strokeWidth="1.2"
        className="[stroke-width:1] sm:[stroke-width:1.2] md:[stroke-width:1.5] lg:[stroke-width:2]"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: 1,
          opacity: [0.1, 0.6, 0.2, 0.5, 0.6],
          d: [
            "M0 100 Q133 150 267 100 Q400 150 533 100 Q667 150 800 100",
            "M0 100 Q133 155 267 100 Q400 155 533 100 Q667 155 800 100",
            "M0 100 Q133 145 267 100 Q400 145 533 100 Q667 145 800 100",
            "M0 100 Q133 150 267 100 Q400 150 533 100 Q667 150 800 100",
          ],
        }}
        transition={{
          pathLength: { duration: 4, ease: "easeInOut", delay: 1 },
          opacity: {
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
            times: [0, 0.25, 0.5, 0.75, 1],
          },
          d: {
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          },
        }}
      />
      <motion.path
        d="M0 100 Q100 80 200 100 Q300 120 400 100 Q500 80 600 100 Q700 120 800 100"
        stroke="currentColor"
        strokeWidth="0.6"
        className="[stroke-width:0.6] sm:[stroke-width:0.8] md:[stroke-width:1] lg:[stroke-width:1.2]"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: 1,
          opacity: [0.05, 0.4, 0.1, 0.3, 0.4],
        }}
        transition={{
          pathLength: { duration: 5, ease: "easeInOut", delay: 2.5 },
          opacity: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
            times: [0, 0.3, 0.6, 0.8, 1],
          },
        }}
      />
    </svg>
  );
}
