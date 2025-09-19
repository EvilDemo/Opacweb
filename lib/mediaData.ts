import {
  sanityClient,
  picturesQuery,
  singlePictureQuery,
  videosQuery,
  musicQuery,
  radioQuery,
} from "./sanity";

export interface Pictures {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  gallery?: string[];
}

export interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  coverImageUrl?: string;
  animatedCoverImageUrl?: string;
}

export interface Music {
  _id: string;
  title: string;
  description: string;
  spotifyUrl: string;
  coverImageUrl?: string;
}

export interface Radio {
  _id: string;
  title: string;
  description: string;
  spotifyUrl: string;
  coverImageUrl?: string;
}

export async function getPictures(): Promise<Pictures[]> {
  try {
    // Skip Sanity calls during build if no project ID is configured
    if (
      !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === "dummy-project-id"
    ) {
      return [];
    }
    return await sanityClient.fetch(picturesQuery);
  } catch (error) {
    console.error("Error fetching pictures:", error);
    return [];
  }
}

export async function getVideos(): Promise<Video[]> {
  try {
    // Skip Sanity calls during build if no project ID is configured
    if (
      !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === "dummy-project-id"
    ) {
      return [];
    }
    return await sanityClient.fetch(videosQuery);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
}

export async function getMusic(): Promise<Music[]> {
  try {
    // Skip Sanity calls during build if no project ID is configured
    if (
      !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === "dummy-project-id"
    ) {
      return [];
    }
    return await sanityClient.fetch(musicQuery);
  } catch (error) {
    console.error("Error fetching music:", error);
    return [];
  }
}

export async function getRadio(): Promise<Radio[]> {
  try {
    // Skip Sanity calls during build if no project ID is configured
    if (
      !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === "dummy-project-id"
    ) {
      return [];
    }
    return await sanityClient.fetch(radioQuery);
  } catch (error) {
    console.error("Error fetching radio:", error);
    return [];
  }
}

export async function getSinglePicture(id: string): Promise<Pictures | null> {
  try {
    // Skip Sanity calls during build if no project ID is configured
    if (
      !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === "dummy-project-id"
    ) {
      return null;
    }
    return await sanityClient.fetch(singlePictureQuery, { id });
  } catch (error) {
    console.error("Error fetching single picture:", error);
    return null;
  }
}
