import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop | OPAC",
  description: "Discover and purchase OPAC merchandise and music.",
};

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="padding-global py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="heading-1 mb-8">Shop</h1>
          <p className="body-large mb-12 text-gray-300">
            Discover OPAC merchandise, music, and exclusive releases.
          </p>

          <div className="bg-neutral-900 rounded-lg p-12 border border-neutral-800">
            <h2 className="heading-2 mb-4">Coming Soon</h2>
            <p className="body-large text-gray-400">
              Our shop is currently under development. Check back soon for
              exclusive OPAC merchandise and music releases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
