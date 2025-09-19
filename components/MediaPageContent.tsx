"use client";

import { useEffect, useState } from "react";
import {
  getPictures,
  getVideos,
  getMusic,
  type Pictures,
  type Video,
  type Music,
} from "@/lib/mediaData";
import { MediaTabs } from "@/components/MediaTabs";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export function MediaPageContent() {
  const [pictures, setPictures] = useState<Pictures[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [music, setMusic] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [picturesData, videosData, musicData] = await Promise.all([
          getPictures(),
          getVideos(),
          getMusic(),
        ]);

        setPictures(picturesData);
        setVideos(videosData);
        setMusic(musicData);
      } catch (error) {
        console.error("Error fetching media data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] px-4 sm:px-8 md:px-12 lg:px-16 pt-8">
      <MediaTabs pictures={pictures} videos={videos} music={music} />
    </div>
  );
}
