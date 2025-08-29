import React from "react";
import Image from "next/image";

export default function Footer() {
  return (
    <div className="h[10vh] w-full text-white flex flex-col gap-4 items-center justify-center py-4">
      <div className="flex flex-row gap-4 items-center justify-center">
        <a
          href="https://www.instagram.com/opac.__/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 hover:opacity-80 hover:scale-110 transition-all"
        >
          <Image
            src="/social-instagram.svg"
            alt="Instagram"
            width={24}
            height={24}
          />
        </a>
        <a
          href="https://www.youtube.com/channel/UCzN054ZKiTzEgrjxaIch3zQ"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 hover:opacity-80 hover:scale-110 transition-all"
        >
          <Image
            src="/social-youtube.svg"
            alt="YouTube"
            width={24}
            height={24}
          />
        </a>
      </div>
      <div className="text-sm">
        <span>© All rights reserved</span>
      </div>
    </div>
  );
}
