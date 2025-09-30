import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

export const config = {
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "dummy-project-id",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-08-28",
  useCdn: false, // Always disable CDN to get fresh data
  perspective: "published" as const, // Ensure we get published content
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
    "thumbnailUrl": thumbnail.asset->url + "?auto=format&w=400&q=85&t=" + _updatedAt,
    "gallery": gallery[].asset->url + "?auto=format&w=800&q=85&t=" + _updatedAt,
    _updatedAt
  }
`;

// Query for a single picture post - keep original URLs for flexibility
export const singlePictureQuery = `
  *[_type == "pictures" && _id == $id][0] {
    _id,
    title,
    description,
    "thumbnailUrl": thumbnail.asset->url + "?auto=format&w=800&q=85&t=" + _updatedAt,
    "gallery": gallery[].asset->url + "?auto=format&w=1200&q=85&t=" + _updatedAt
  }
`;

export const videosQuery = `
  *[_type == "video"] | order(_updatedAt desc) {
    _id,
    title,
    description,
    "videoUrl": videoUrl,
    "thumbnailUrl": thumbnail.asset->url + "?auto=format&w=400&q=85&t=" + _updatedAt,
    _updatedAt
  }
`;

export const musicQuery = `
  *[_type == "music"] | order(_updatedAt desc) {
    _id,
    title,
    description,
    spotifyUrl,
    "thumbnailUrl": thumbnail.asset->url + "?auto=format&w=400&q=85&t=" + _updatedAt,
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
