import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

export const config = {
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "dummy-project-id",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-08-28",
  useCdn: process.env.NODE_ENV === "production", // Use CDN in production for better caching
  perspective: "published" as const, // Ensure we get published content
  // Disable live content to prevent WebSocket connections
  studioUrl: false, // Disable studio URL to prevent live connections
  // Disable caching in development
  ...(process.env.NODE_ENV === "development" && {
    token: process.env.SANITY_API_TOKEN, // Use token for fresh data in dev
  }),
};

export const sanityClient = createClient(config);

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// GROQ queries for fetching content with consistent image URLs
export const picturesQuery = `
  *[_type == "pictures"] | order(_updatedAt desc) {
    _id,
    title,
    description,
    "thumbnailUrl": thumbnail.asset->url + "?auto=format&w=400&q=75&t=" + _updatedAt,
    _updatedAt
  }
`;

// Query for gallery images only - get raw URLs without transforms
export const galleryQuery = `
  *[_type == "pictures" && _id == $id][0] {
    "gallery": gallery[].asset->url
  }
`;

export const videosQuery = `
  *[_type == "video"] | order(_updatedAt desc) {
    _id,
    title,
    description,
    "videoUrl": videoUrl,
    "thumbnailUrl": thumbnail.asset->url + "?auto=format&w=400&q=75&t=" + _updatedAt,
    _updatedAt
  }
`;

export const musicQuery = `
  *[_type == "music"] | order(_updatedAt desc) {
    _id,
    title,
    description,
    spotifyUrl,
    "thumbnailUrl": thumbnail.asset->url + "?auto=format&w=400&q=75&t=" + _updatedAt,
    _updatedAt
  }
`;

export const radioQuery = `
  *[_type == "radio"] | order(_updatedAt desc) {
    _id,
    title,
    description,
    spotifyUrl,
    "thumbnailUrl": thumbnail.asset->url + "?auto=format&fm=webp&w=180&q=60&fit=crop&crop=center&h=278&t=" + _updatedAt,
    _updatedAt
  }
`;
