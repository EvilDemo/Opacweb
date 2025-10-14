"use client";

import { A0TYRotatingCross } from "@/components/three/A0TYRotatingCross";
import { motion } from "motion/react";
import { useRef } from "react";
import Image from "next/image";

const songs = [
  {
    id: 1,
    src: "aoty-songs/song-1.webp",
    url: "https://open.spotify.com/track/3eWPe1RYtLsBETNG5ZdF0E?si=e14ceec5d09d4bc6",
  },
  {
    id: 2,
    src: "aoty-songs/song-2.webp",
    url: "https://open.spotify.com/track/1zkLJK1rBJjaAGssRBoeVx?si=24bbf30227554e1b",
  },
  {
    id: 3,
    src: "aoty-songs/song-3.webp",
    url: "https://open.spotify.com/track/7rsxWRX9zTYZwhmI48KyyV?si=fb0e16433f3f42b7",
  },
  {
    id: 4,
    src: "aoty-songs/song-4.webp",
    url: "https://open.spotify.com/track/66BQtMftEEOkQ8l9UIxM9n?si=f1bc647e7e8d4743",
  },
  {
    id: 5,
    src: "aoty-songs/song-5.webp",
    url: "https://open.spotify.com/track/1WT2hwUcPWDDtWkJoz0v5w?si=e146a4d4b6674a4f",
  },
];

export default function AotyHero() {
  const ref = useRef(null);

  return (
    <section className="relative w-full min-h-[calc(100vh-6rem)] flex items-center justify-center padding-global">
      <div className="flex flex-col xl:flex-row items-center justify-center w-full gap-8 xl:gap-0">
        {/* Cross div - enters from left */}
        <motion.div
          className="flex flex-col w-full xl:w-1/2 h-[70vh] max-h-[70vh] xl:h-auto xl:max-h-none aspect-square items-center justify-center relative"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Image
            src="/aoty-cover-front.webp"
            alt="A0TY Cover"
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0">
            <A0TYRotatingCross />
          </div>
        </motion.div>

        {/* Video div - enters from right */}
        <motion.div
          className="flex flex-col w-full xl:w-1/2 h-[70vh] max-h-[70vh] xl:h-auto xl:max-h-none aspect-square items-center justify-center relative"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <video
            key="aoty-video"
            src="/aoty-video.mp4?v=2"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {/* spotify embed */}
          {/* <div className="absolute bottom-4 padding-global w-full">
            <iframe
              data-testid="embed-iframe"
              style={{ borderRadius: "1px" }}
              src="https://open.spotify.com/embed/album/0Uem3wM8ZJ6rLwPhNNB1NS?utm_source=generator&theme=0"
              width="100%"
              height="300px"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div> */}
          {/* Songs - animate after the main sections */}
          <motion.div
            ref={ref}
            className="absolute bottom-[10%] left-[15%] "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          >
            <div className="flex flex-col gap-2 md:gap-3 xl:gap-4 items-start justify-start w-full">
              {songs.map((song) => (
                <motion.a
                  key={song.id}
                  href={song.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 md:h-12 xl:h-12 w-auto block overflow-hidden relative"
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                  <Image
                    src={`/${song.src}`}
                    alt=""
                    height={48}
                    width={200}
                    sizes="200px"
                    className="h-full w-auto object-contain object-left"
                  />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
