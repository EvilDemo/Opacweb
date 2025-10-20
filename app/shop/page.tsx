import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop | OPAC",
  description: "Discover and purchase OPAC merchandise and music.",
};

export default function ShopPage() {
  return (
    <section className="flex items-center justify-center bg-black text-white padding-global py-16 min-h-[calc(100vh-6rem)]">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center gap-4 h-full">
        <div className="bg-neutral-900 rounded-lg p-12 border border-neutral-800">
          <h2 className="heading-2 mb-4">Coming Soon</h2>
          <p className="body-large text-gray-400">
            Our shop is currently under development. Check back soon for exclusive OPAC merchandise and music releases.
          </p>
        </div>
      </div>
    </section>
  );
}
