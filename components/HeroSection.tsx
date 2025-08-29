import Link from "next/link";
import React from "react";

export default function HeroSection() {
  return (
    <div className="w-full h-[80vh] flex items-center justify-center">
      <div className="p-0 grid grid-cols-2 gap-3 sm:gap-4 lg:flex lg:flex-row lg:gap-6 xl:gap-8 2xl:gap-10 items-center justify-center place-items-center lg:place-items-stretch h-auto lg:items-center lg:justify-center max-w-[400px] sm:max-w-[500px] lg:max-w-none">
        <Link
          href="/shop"
          className="w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] lg:w-[200px] lg:h-[200px] xl:w-[250px] xl:h-[250px] 2xl:w-[300px] 2xl:h-[300px] flex justify-center items-center"
        >
          <div
            className="w-full h-full aspect-square bg-cover bg-center bg-no-repeat hover:scale-110 transition-transform duration-300"
            style={{ backgroundImage: "url(/menu-shop.gif)" }}
          />
        </Link>
        <Link
          href="/media"
          className="w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] lg:w-[200px] lg:h-[200px] xl:w-[250px] xl:h-[250px] 2xl:w-[300px] 2xl:h-[300px] flex justify-center items-center"
        >
          <div
            className="w-full h-full aspect-square bg-cover bg-center bg-no-repeat hover:scale-110 transition-transform duration-300"
            style={{ backgroundImage: "url(/menu-media.gif)" }}
          />
        </Link>
        <Link
          href="/about"
          className="w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] lg:w-[200px] lg:h-[200px] xl:w-[250px] xl:h-[250px] 2xl:w-[300px] 2xl:h-[300px] flex justify-center items-center"
        >
          <div
            className="w-full h-full aspect-square bg-cover bg-center bg-no-repeat hover:scale-110 transition-transform duration-300"
            style={{ backgroundImage: "url(/menu-about.gif)" }}
          />
        </Link>
        <Link
          href="/contact"
          className="w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] lg:w-[200px] lg:h-[200px] xl:w-[250px] xl:h-[250px] 2xl:w-[300px] 2xl:h-[300px] flex justify-center items-center"
        >
          <div
            className="w-full h-full aspect-square bg-cover bg-center bg-no-repeat hover:scale-110 transition-transform duration-300"
            style={{ backgroundImage: "url(/menu-contact.gif)" }}
          />
        </Link>
      </div>
    </div>
  );
}
