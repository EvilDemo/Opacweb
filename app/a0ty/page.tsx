import type { Metadata } from "next";
import { A0TYRotatingCross } from "@/components/three/A0TYRotatingCross";

export const metadata: Metadata = {
  title: "A0TY",
  description: "Album of the Year - A0TY by Opac",
};

export default function A0TYPage() {
  return (
    <section className="relative w-full max-h-[calc(100vh-6rem)] flex items-center justify-center padding-global">
      <div className="flex flex-row items-center justify-center">
        <div className="flex flex-col w-1/2 items-center justify-center relative">
          <img src="/aoty-cover-front.webp" alt="A0TY Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0">
            <A0TYRotatingCross />
          </div>
        </div>
        <div className="flex flex-col w-1/2 items-center justify-center relative">
          <video
            key="aoty-video"
            src="/aoty-video.mp4?v=2"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 padding-global w-full">
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
          </div>
        </div>
      </div>
    </section>
  );
}
