import type { Metadata } from "next";
import { A0TYRotatingCross } from "@/components/three/A0TYRotatingCross";

export const metadata: Metadata = {
  title: "A0TY",
  description: "Album of the Year - A0TY by Opac",
};

export default function A0TYPage() {
  return (
    <section className="relative w-full min-h-[calc(100vh-6rem)] flex items-center justify-center padding-global">
      <div className="flex flex-row items-center justify-center ">
        <div className="flex flex-col w-1/2 items-center justify-center relative">
          <img src="aoty-cover-front.webp" alt="A0TY Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0">
            <A0TYRotatingCross />
          </div>
        </div>
        <div className="flex flex-col w-1/2 items-center justify-center ">
          <img src="aoty-cover-back.webp" alt="A0TY Cover" className="w-full h-full object-cover" />
        </div>
      </div>
    </section>
  );
}
