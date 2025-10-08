import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A0TY",
  description: "Album of the Year - A0TY by Opac",
};

export default function A0TYPage() {
  return (
    <section className="relative w-full min-h-[calc(100vh-6rem)] flex items-center justify-center padding-global">
      <div className="text-center">
        <h1 className="display-text font-bold">A0TY</h1>
      </div>
    </section>
  );
}
