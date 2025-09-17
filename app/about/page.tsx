"use client";

import React from "react";
import { AboutHeroSection } from "@/components/AboutHeroSection";
import { AboutManifestoSection } from "@/components/AboutManifestoSection";
import { PrinciplesSection } from "@/components/AboutPrinciplesSection";

const AboutPage = () => {
  return (
    <>
      <AboutHeroSection />
      <AboutManifestoSection />
      <PrinciplesSection />
    </>
  );
};

export default AboutPage;

// <motion.section ref={sectionRef} className="h-[300vh] hidden">
//   <motion.div className="h-[calc(100vh-6rem)] mt-[-6rem] pt-[6rem] flex items-center justify-center text-center sticky top-0">
//     <motion.div
//       className="absolute"
//       style={{
//         opacity: useTransform(
//           scrollYProgress,
//           [0, 0.1, 0.3, 0.4],
//           [1, 1, 0.5, 0]
//         ),
//       }}
//     >
//       <motion.h1
//         initial={{ opacity: 0, y: 30, scale: 0.8 }}
//         animate={{ opacity: 1, y: 0, scale: 1 }}
//         transition={{
//           duration: 0.8,
//           delay: 0.1,
//           ease: [0.25, 0.46, 0.45, 0.94],
//         }}
//         style={{
//           y: useTransform(scrollYProgress, [0, 0.1, 0.3], [0, -8, -16]),
//           scale: useTransform(
//             scrollYProgress,
//             [0, 0.1, 0.4],
//             [1, 1.12, 1.24]
//           ),
//         }}
//       >
//         Embracing
//       </motion.h1>
//       <motion.h1
//         initial={{ opacity: 0, y: 30, scale: 0.8 }}
//         animate={{ opacity: 1, y: 0, scale: 1 }}
//         transition={{
//           duration: 0.8,
//           delay: 0.3,
//           ease: [0.25, 0.46, 0.45, 0.94],
//         }}
//         style={{
//           y: useTransform(scrollYProgress, [0, 0.1, 0.3], [0, -12, -24]),
//           scale: useTransform(
//             scrollYProgress,
//             [0, 0.1, 0.4],
//             [1, 1.18, 1.36]
//           ),
//         }}
//       >
//         individuality
//       </motion.h1>
//     </motion.div>
//     <motion.div
//       className="absolute"
//       style={{
//         opacity: useTransform(
//           scrollYProgress,
//           [0.6, 0.7, 0.8, 0.9, 1],
//           [0, 1, 1, 0.5, 0]
//         ),
//       }}
//     >
//       <motion.h1
//         initial={{ opacity: 0, x: -50, scale: 0.9 }}
//         animate={{ opacity: 1, x: 0, scale: 1 }}
//         transition={{
//           duration: 0.7,
//           delay: 0.1,
//           ease: [0.23, 1, 0.32, 1],
//         }}
//         style={{
//           x: useTransform(
//             scrollYProgress,
//             [0.6, 0.7, 0.9, 1, 1],
//             [0, 6, 12, 18, 24]
//           ),
//           scale: useTransform(
//             scrollYProgress,
//             [0.6, 0.7, 1],
//             [1, 1.12, 1.24]
//           ),
//         }}
//       >
//         Embracing
//       </motion.h1>
//       <motion.h1
//         initial={{ opacity: 0, x: 50, scale: 0.9 }}
//         animate={{ opacity: 1, x: 0, scale: 1 }}
//         transition={{
//           duration: 0.7,
//           delay: 0.3,
//           ease: [0.23, 1, 0.32, 1],
//         }}
//         style={{
//           x: useTransform(scrollYProgress, [0.6, 0.7, 1], [0, -6, -12]),
//           scale: useTransform(
//             scrollYProgress,
//             [0.6, 0.7, 1],
//             [1, 1.18, 1.36]
//           ),
//         }}
//       >
//         the difference.
//       </motion.h1>
//     </motion.div>
//   </motion.div>
// </motion.section>;
