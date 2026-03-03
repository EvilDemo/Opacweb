import { sanityClient, picturesQuery, galleryQuery, videosQuery, musicQuery, radioQuery } from "./sanity";
import { cache } from "react";

export interface Pictures {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  _updatedAt: string;
}

export interface Gallery {
  gallery: string[];
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
  albumWebsite?: string;
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

function hasSanityConfiguration(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "dummy-project-id"
  );
}

const fetchPictures = cache(async (): Promise<Pictures[]> => {
  try {
    if (!hasSanityConfiguration()) {
      return [];
    }

    return await sanityClient.fetch(
      picturesQuery,
      {},
      {
        next: {
          revalidate: process.env.NODE_ENV === "development" ? 0 : 3600,
          tags: ["pictures"],
        },
      }
    );
  } catch (error) {
    console.error("Error fetching pictures:", error);
    return [];
  }
});

const fetchVideos = cache(async (): Promise<Video[]> => {
  try {
    if (!hasSanityConfiguration()) {
      return [];
    }

    return await sanityClient.fetch(
      videosQuery,
      {},
      {
        next: {
          revalidate: process.env.NODE_ENV === "development" ? 0 : 3600,
          tags: ["videos"],
        },
      }
    );
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
});

const fetchMusic = cache(async (): Promise<Music[]> => {
  try {
    if (!hasSanityConfiguration()) {
      return [];
    }

    return await sanityClient.fetch(
      musicQuery,
      {},
      {
        next: {
          revalidate: process.env.NODE_ENV === "development" ? 0 : 3600,
          tags: ["music"],
        },
      }
    );
  } catch (error) {
    console.error("Error fetching music:", error);
    return [];
  }
});

const fetchRadio = cache(async (): Promise<Radio[]> => {
  try {
    if (!hasSanityConfiguration()) {
      return [];
    }

    return await sanityClient.fetch(
      radioQuery,
      {},
      {
        next: {
          revalidate: process.env.NODE_ENV === "development" ? 0 : 3600,
          tags: ["radio"],
        },
      }
    );
  } catch (error) {
    console.error("Error fetching radio:", error);
    return [];
  }
});

const fetchGallery = cache(async (id: string): Promise<Gallery | null> => {
  try {
    if (!hasSanityConfiguration()) {
      return null;
    }

    return await sanityClient.fetch(
      galleryQuery,
      { id },
      {
        next: {
          revalidate: process.env.NODE_ENV === "development" ? 0 : 3600,
          tags: ["gallery", `gallery-${id}`],
        },
      }
    );
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return null;
  }
});

export async function getPictures(): Promise<Pictures[]> {
  return fetchPictures();
}

export async function getVideos(): Promise<Video[]> {
  return fetchVideos();
}

export async function getMusic(): Promise<Music[]> {
  return fetchMusic();
}

export async function getRadio(): Promise<Radio[]> {
  return fetchRadio();
}

export async function getGallery(id: string): Promise<Gallery | null> {
  return fetchGallery(id);
}
