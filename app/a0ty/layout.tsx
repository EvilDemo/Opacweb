import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A0TY",
  description: "Album of the Year - A0TY by Opac",
};

export default function A0TYLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
