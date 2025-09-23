"use client";

import { useEffect, useState, useRef } from "react";
import { getRadio, type Radio } from "@/lib/mediaData";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Radio as RadioIcon, Play } from "lucide-react";
import NextImage from "next/image";
import { motion, useScroll, useTransform } from "motion/react";

// Mock curator data - in a real app, this would come from your CMS
const curators = [
  { name: "Frank Bach", avatar: "/api/placeholder/40/40" },
  { name: "Jorn van Dijk", avatar: "/api/placeholder/40/40" },
  { name: "Fons Mans", avatar: "/api/placeholder/40/40" },
];

// Color schemes for playlist cards
const playlistColors = [
  { bg: "bg-black", text: "text-white", playBg: "bg-green-500" },
  { bg: "bg-pink-500", text: "text-white", playBg: "bg-yellow-500" },
  { bg: "bg-yellow-400", text: "text-black", playBg: "bg-blue-500" },
];

export function RadioPageClient() {
  const [radio, setRadio] = useState<Radio[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchRadioData() {
      try {
        const radioData = await getRadio();
        setRadio(radioData);
      } catch (error) {
        console.error("Error fetching radio data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRadioData();
  }, []);

  const { scrollYProgress: horizontalScrollProgress } = useScroll({
    target: horizontalScrollRef,
    offset: ["start start", "end start"],
  });

  const xTransform = useTransform(
    horizontalScrollProgress,
    [0, 1],
    ["0%", `-${(radio.length - 1) * 100}%`]
  );

  if (!mounted || loading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div className="h-[200vh] bg-white" ref={horizontalScrollRef}>
      <div className="sticky top-0 h-[calc(100vh-6rem)] mt-[-6rem] pt-[6rem] overflow-hidden">
        <div className="h-full flex">
          {/* Left Section - Text Content */}
          <div className="flex-shrink-0 w-full lg:w-1/2 xl:w-2/5 flex items-center">
            <div className="px-4 sm:px-8 md:px-12 lg:px-16 w-full">
              <h2 className="heading-1 text-black mb-6">
                Discover what designers are listening to while they design.
                <span className="inline-block w-1 h-12 bg-pink-500 ml-2 animate-pulse"></span>
              </h2>

              {/* Curators Section */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {curators.map((curator, index) => (
                    <div
                      key={index}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white flex items-center justify-center"
                    >
                      <span className="text-sm font-medium text-gray-600">
                        {curator.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="body-text text-black">
                  Playlists by Frank Bach, Jorn van Dijk, Fons Mans, and others.
                </p>
              </div>
            </div>
          </div>

          {/* Right Section - Horizontal Scrolling Cards */}
          <div className="flex-shrink-0 w-full lg:w-1/2 xl:w-3/5 flex items-center overflow-hidden">
            {radio.length === 0 ? (
              <div className="text-center w-full">
                <RadioIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="body-text text-muted">
                  No radio content available yet.
                </p>
                <p className="body-text-sm text-muted-foreground mt-2">
                  Check back soon for our curated playlists and radio shows!
                </p>
              </div>
            ) : (
              <motion.div
                className="flex gap-6 items-center"
                style={{
                  x: xTransform,
                }}
              >
                {radio.map((playlist, index) => {
                  const colorScheme =
                    playlistColors[index % playlistColors.length];
                  return (
                    <div
                      key={playlist._id}
                      className={`${colorScheme.bg} ${colorScheme.text} rounded-2xl p-6 flex-shrink-0 w-80 h-96 flex flex-col justify-between`}
                    >
                      {/* Cover Art */}
                      <div className="w-32 h-32 bg-muted flex items-center justify-center overflow-hidden rounded-xl mb-4">
                        {playlist.coverImageUrl ? (
                          <NextImage
                            src={playlist.coverImageUrl}
                            alt={`${playlist.title} cover`}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <RadioIcon className="h-16 w-16 text-muted-foreground" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="heading-4 mb-2">{playlist.title}</h3>
                        <p className="body-text-sm opacity-80 mb-2">
                          Curated by Opac Team
                        </p>
                        <p className="paragraph-mini-regular opacity-70 mb-4 leading-relaxed">
                          A carefully curated playlist for designers. Hit play
                          to discover some new sounds...
                        </p>
                        <p className="paragraph-mini-regular opacity-60">
                          Various Artists & Others
                        </p>
                      </div>

                      {/* Play Button */}
                      <div className="flex items-center gap-3 mt-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            O
                          </span>
                        </div>
                        <a
                          href={playlist.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${colorScheme.playBg} hover:opacity-80 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200`}
                        >
                          <Play className="w-5 h-5 text-white ml-1" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
