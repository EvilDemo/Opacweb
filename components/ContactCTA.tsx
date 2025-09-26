"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Instagram, Youtube, Music, CloudRain } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

export default function ContactCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className="py-20"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container mx-auto padding-global">
        <div className="text-center mb-16">
          <motion.h2
            className="heading-3 font-semibold  text-white mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            Follow the Frequency.
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {/* Instagram */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={
                isInView
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 40, scale: 0.95 }
              }
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
                    <h3 className="body-text-lg font-semibold mb-1">
                      Instagram
                    </h3>
                    <p className="text-neutral-400 text-sm">@opac.label</p>
                  </CardContent>
                </Card>
              </a>
            </motion.div>

            {/* YouTube */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={
                isInView
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 40, scale: 0.95 }
              }
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
                    <p className="text-neutral-400 text-sm">OPAC Label</p>
                  </CardContent>
                </Card>
              </a>
            </motion.div>

            {/* Spotify */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={
                isInView
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 40, scale: 0.95 }
              }
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

            {/* SoundCloud */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={
                isInView
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 40, scale: 0.95 }
              }
              transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
            >
              <a
                href="https://soundcloud.com/opac-label"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                aria-label="Listen to OPAC Label on SoundCloud"
              >
                <Card variant="contactCTA">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-neutral-700 rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:bg-neutral-600 transition-colors duration-300">
                      <CloudRain className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="body-text-lg font-semibold mb-1">
                      SoundCloud
                    </h3>
                    <p className="text-neutral-400 text-sm">OPAC Label</p>
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
