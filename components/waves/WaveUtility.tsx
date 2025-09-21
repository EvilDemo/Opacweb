import { motion } from "motion/react";

export function WaveUtility() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 200"
      className="w-full h-full opacity-85"
      preserveAspectRatio="xMidYMid meet"
    >
      <motion.path
        d="M0 100 L133 60 L266 140 L400 40 L533 130 L666 80 L800 100"
        stroke="currentColor"
        strokeWidth="4"
        className="[stroke-width:3] sm:[stroke-width:4] md:[stroke-width:5] lg:[stroke-width:6]"
        fill="none"
        strokeLinecap="square"
        strokeLinejoin="miter"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 2,
          ease: "linear",
        }}
      />
      <motion.path
        d="M0 100 L100 70 L200 130 L300 50 L400 120 L500 85 L600 135 L700 65 L800 100"
        stroke="currentColor"
        strokeWidth="1.5"
        className="[stroke-width:1.5] sm:[stroke-width:2] md:[stroke-width:2.5] lg:[stroke-width:3]"
        fill="none"
        strokeLinecap="square"
        strokeLinejoin="miter"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{
          duration: 2.5,
          ease: "linear",
          delay: 0.5,
        }}
      />
      <motion.g>
        {[133, 266, 400, 533, 666].map((x, i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={
              i === 0
                ? 60 // x=133, y=60
                : i === 1
                ? 140 // x=266, y=140
                : i === 2
                ? 40 // x=400, y=40
                : i === 3
                ? 130 // x=533, y=130
                : 80 // x=666, y=80 (last circle)
            }
            r="5"
            className="[r:4] sm:[r:5] md:[r:6] lg:[r:7]"
            fill="currentColor"
            animate={{
              scale: [0.6, 1.4, 0.6],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.g>
      <motion.g
        animate={{
          opacity: [0, 0.8, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        {[100, 200, 300, 500, 600, 700].map((x, i) => (
          <motion.rect
            key={i}
            x={x - 2}
            y={
              i % 3 === 0
                ? 68
                : i % 3 === 1
                ? 128
                : i === 1
                ? 48
                : i === 3
                ? 83
                : i === 5
                ? 63
                : 118
            }
            width="3"
            height="3"
            className="[width:2.5] [height:2.5] sm:[width:3] sm:[height:3] md:[width:4] md:[height:4] lg:[width:5] lg:[height:5]"
            fill="currentColor"
            animate={{
              scaleY: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.g>
    </svg>
  );
}
