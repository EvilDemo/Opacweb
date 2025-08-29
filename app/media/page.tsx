"use client";

import { useEffect, useState } from "react";
import {
  getPictures,
  getVideos,
  getMusic,
  getRadio,
  type Pictures,
  type Video,
  type Music,
  type Radio,
} from "@/lib/mediaData";
import { MediaTabs } from "@/components/MediaTabs";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function MediaPage() {
  const [pictures, setPictures] = useState<Pictures[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [music, setMusic] = useState<Music[]>([]);
  const [radio, setRadio] = useState<Radio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [picturesData, videosData, musicData, radioData] =
          await Promise.all([
            getPictures(),
            getVideos(),
            getMusic(),
            getRadio(),
          ]);

        setPictures(picturesData);
        setVideos(videosData);
        setMusic(musicData);
        setRadio(radioData);
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
    <div className="container mx-auto min-h-screen px-4 py-8">
      <MediaTabs
        pictures={pictures}
        videos={videos}
        music={music}
        radio={radio}
      />
    </div>
  );
}
