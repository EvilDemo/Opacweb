import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A0TY",
  description: "Album of the Year - A0TY by Opac",
};

export default function A0TYPage() {
  return (
    <section className="relative w-full min-h-[calc(100vh-6rem)] flex items-center justify-center padding-global">
      <div className="flex flex-row items-center justify-center">
        <div className="flex flex-col w-1/2 items-center justify-center">
          <h1 className="display-text font-bold w-full">A0TY</h1>
        </div>
        <div className="flex flex-col w-1/2 items-center justify-center ">
          <p className="body-text-sm text-muted w-full">Album of the Year - A0TY by Opac</p>
        </div>
      </div>
    </section>
  );
}
