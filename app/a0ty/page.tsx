import type { Metadata } from "next";
import AotyHero from "@/components/AotyHero";

export const metadata: Metadata = {
  title: "A0TY",
  description: "Album of the Year - A0TY by Opac",
};

export default function A0TYPage() {
  return <AotyHero />;
}
