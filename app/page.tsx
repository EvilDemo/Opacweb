import HeroSection from "@/components/HeroSection";
import React from "react";

export default function Home() {
  return (
    <div className="flex flex-col row-start-2 justify-around sm:items-start">
      <HeroSection />
      <div>this is staging environment</div>
    </div>
  );
}
