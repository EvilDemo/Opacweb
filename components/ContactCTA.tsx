"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Instagram, Youtube, Music } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

// Custom TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export default function ContactCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className="py-20 padding-global mt-20"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container mx-auto ">
        <div className="text-center md:mb-16">
          <motion.h2
            className="heading-3  text-white mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            Follow the Frequency.
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {/* Instagram */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              <a
                href="https://www.instagram.com/opac.__/"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                aria-label="Follow OPAC on Instagram @opac.label"
              >
                <Card variant="contactCTA">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-neutral-700 rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:bg-neutral-600 transition-colors duration-300">
                      <Instagram className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="body-text-lg font-semibold mb-1">Instagram</h3>
                    <p className="text-neutral-400 text-sm">@opac.__</p>
                  </CardContent>
                </Card>
              </a>
            </motion.div>

            {/* YouTube */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            >
              <a
                href="https://www.youtube.com/channel/UCzN054ZKiTzEgrjxaIch3zQ"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                aria-label="Subscribe to OPAC Label on YouTube"
              >
                <Card variant="contactCTA">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-neutral-700 rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:bg-neutral-600 transition-colors duration-300">
                      <Youtube className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="body-text-lg font-semibold mb-1">YouTube</h3>
                    <p className="text-neutral-400 text-sm">@joyaboi</p>
                  </CardContent>
                </Card>
              </a>
            </motion.div>

            {/* Spotify */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            >
              <a
                href="https://open.spotify.com/user/3123jk5vvrcjh2pljngwtmlulhsq"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                aria-label="Listen to OPAC on Spotify"
              >
                <Card variant="contactCTA">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-neutral-700 rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:bg-neutral-600 transition-colors duration-300">
                      <Music className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="body-text-lg font-semibold mb-1">Spotify</h3>
                    <p className="text-neutral-400 text-sm">OPAC</p>
                  </CardContent>
                </Card>
              </a>
            </motion.div>

            {/* TikTok */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
            >
              <a
                href="https://www.tiktok.com/@opacweb?_t=ZG-90RboIyLltx&_r=1"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                aria-label="Follow OPAC on TikTok"
              >
                <Card variant="contactCTA">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-neutral-700 rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:bg-neutral-600 transition-colors duration-300">
                      <TikTokIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="body-text-lg font-semibold mb-1">TikTok</h3>
                    <p className="text-neutral-400 text-sm">@opacweb</p>
                  </CardContent>
                </Card>
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
