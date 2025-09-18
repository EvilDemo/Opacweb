import React from "react";
import type { Metadata } from "next";
import { AboutHeroSection } from "@/components/AboutHeroSection";
import { AboutManifestoSection } from "@/components/AboutManifestoSection";
import { PrinciplesSection } from "@/components/AboutPrinciplesSection";

export const metadata: Metadata = {
  title: "About Opac | Embracing the Difference",
  description:
    "We are not here to fill silence. We are here to bend it. Learn about Opac's mission to create residue through music and clothing - a trace of something unspoken.",
  keywords: [
    "opac about",
    "music collective",
    "fashion brand",
    "artistic philosophy",
    "individuality",
    "creative mission",
    "portugal collective",
  ],
  authors: [{ name: "Opac" }],
  creator: "Opac",
  publisher: "Opac",
  openGraph: {
    title: "About Opac | Embracing the Difference",
    description:
      "We are not here to fill silence. We are here to bend it. Discover Opac's philosophy and approach to music and fashion.",
    url: "https://weareopac.com/about",
    siteName: "Opac",
    images: [
      {
        url: "/og-about.jpg",
        width: 1200,
        height: 630,
        alt: "About Opac - Our Philosophy and Mission",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Opac | Embracing the Difference",
    description: "We are not here to fill silence. We are here to bend it.",
    images: ["/twitter-about.jpg"],
  },
  alternates: {
    canonical: "https://weareopac.com/about",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

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
