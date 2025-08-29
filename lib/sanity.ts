import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

export const config = {
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-08-28",
  useCdn: process.env.NODE_ENV === "production",
};

export const sanityClient = createClient(config);

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// GROQ queries for fetching content
export const picturesQuery = `
  *[_type == "pictures"] {
    _id,
    title,
    description,
    "thumbnailUrl": thumbnail.asset->url,
    gallery
  }
`;

export const videosQuery = `
  *[_type == "video"] {
    _id,
    title,
    description,
    "videoUrl": videoUrl,
    "coverImageUrl": coverImage.asset->url,
    "animatedCoverImageUrl": animatedCoverImage.asset->url
  }
`;

export const musicQuery = `
  *[_type == "music"] {
    _id,
    title,
    description,
    spotifyUrl,
    "coverImageUrl": coverImage.asset->url
  }
`;

export const radioQuery = `
  *[_type == "radio"] {
    _id,
    title,
    description,
    spotifyUrl,
    "coverImageUrl": coverImage.asset->url
  }
`;
