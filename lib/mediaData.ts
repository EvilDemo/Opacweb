import {
  sanityClient,
  picturesQuery,
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
    return await sanityClient.fetch(picturesQuery);
  } catch (error) {
    console.error("Error fetching pictures:", error);
    return [];
  }
}

export async function getVideos(): Promise<Video[]> {
  try {
    return await sanityClient.fetch(videosQuery);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
}

export async function getMusic(): Promise<Music[]> {
  try {
    return await sanityClient.fetch(musicQuery);
  } catch (error) {
    console.error("Error fetching music:", error);
    return [];
  }
}

export async function getRadio(): Promise<Radio[]> {
  try {
    return await sanityClient.fetch(radioQuery);
  } catch (error) {
    console.error("Error fetching radio:", error);
    return [];
  }
}
