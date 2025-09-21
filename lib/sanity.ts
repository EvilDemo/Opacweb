import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

export const config = {
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "dummy-project-id",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-08-28",
  useCdn: process.env.NODE_ENV === "production",
};

export const sanityClient = createClient(config);

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// GROQ queries for fetching content with optimized URLs
export const picturesQuery = `
  *[_type == "pictures"] | order(_createdAt desc) {
    _id,
    title,
    description,
    "thumbnailUrl": thumbnail.asset->url + "?auto=format&w=400&q=80",
    "gallery": gallery[].asset->url
  }
`;

// Query for a single picture post - keep original URLs for flexibility
export const singlePictureQuery = `
  *[_type == "pictures" && _id == $id][0] {
    _id,
    title,
    description,
    "thumbnailUrl": thumbnail.asset->url,
    "gallery": gallery[].asset->url
  }
`;

export const videosQuery = `
  *[_type == "video"] | order(_createdAt desc) {
    _id,
    title,
    description,
    "videoUrl": videoUrl,
    "coverImageUrl": coverImage.asset->url + "?auto=format&w=400&q=85",
    "animatedCoverImageUrl": animatedCoverImage.asset->url + "?auto=format&w=400&q=85"
  }
`;

export const musicQuery = `
  *[_type == "music"] | order(_createdAt desc) {
    _id,
    title,
    description,
    spotifyUrl,
    "coverImageUrl": coverImage.asset->url + "?auto=format&w=400&q=85"
  }
`;

export const radioQuery = `
  *[_type == "radio"] | order(_createdAt desc) {
    _id,
    title,
    description,
    spotifyUrl,
    "coverImageUrl": coverImage.asset->url + "?auto=format&w=400&q=85",
    _createdAt
  }
`;
