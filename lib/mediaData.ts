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
  _updatedAt: string;
}

export interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  _updatedAt: string;
}

export interface Music {
  _id: string;
  title: string;
  description: string;
  spotifyUrl: string;
  thumbnailUrl?: string;
  _updatedAt: string;
}

export interface Radio {
  _id: string;
  title: string;
  description: string;
  spotifyUrl: string;
  thumbnailUrl?: string;
  _updatedAt: string;
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
    return await sanityClient.fetch(
      picturesQuery,
      {},
      {
        next: {
          revalidate: 60, // Cache for 1 minute
          tags: ["pictures"],
        },
      }
    );
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
    return await sanityClient.fetch(
      videosQuery,
      {},
      {
        next: {
          revalidate: 60, // Cache for 1 minute
          tags: ["videos"],
        },
      }
    );
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
    return await sanityClient.fetch(
      musicQuery,
      {},
      {
        next: {
          revalidate: 60, // Cache for 1 minute
          tags: ["music"],
        },
      }
    );
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
    return await sanityClient.fetch(
      radioQuery,
      {},
      {
        next: {
          revalidate: 3600, // Cache for 1 hour
          tags: ["radio"],
        },
      }
    );
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
