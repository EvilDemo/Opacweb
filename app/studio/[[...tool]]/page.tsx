/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * You can learn more about the next-sanity package here:
 * https://github.com/sanity-io/next-sanity
 */

import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";
import type { Metadata } from "next";

export const dynamic = "force-static";

// Override Sanity's metadata to ensure SEO hiding
export const metadata: Metadata = {
  title: "Opac Studio | Content Management",
  description:
    "Opac's content management studio for managing music, media, and creative content.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
};

export default function StudioPage() {
  return (
    <div className="min-h-[calc(100vh-6rem)] padding-global py-8">
      <NextStudio config={config} />
    </div>
  );
}
