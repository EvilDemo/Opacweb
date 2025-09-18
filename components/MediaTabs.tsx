"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Music as MusicIcon,
} from "lucide-react";
import { type Pictures, type Video, type Music } from "@/lib/mediaData";
import { MediaCard, type MediaItem } from "@/components/MediaCard";

interface MediaTabsProps {
  pictures: Pictures[];
  videos: Video[];
  music: Music[];
}

// Helper functions to transform data to MediaCard format
const transformPictures = (pictures: Pictures[]): MediaItem[] =>
  pictures.map((item) => ({ ...item, type: "picture" as const }));

const transformVideos = (videos: Video[]): MediaItem[] =>
  videos.map((item) => ({ ...item, type: "video" as const }));

const transformMusic = (music: Music[]): MediaItem[] =>
  music.map((item) => ({ ...item, type: "music" as const }));

export function MediaTabs({ pictures, videos, music }: MediaTabsProps) {
  return (
    <Tabs defaultValue="pictures" className="w-full ">
      <TabsList className="grid w-full grid-cols-3 h-auto gap-2">
        <TabsTrigger value="pictures" className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Pictures
        </TabsTrigger>
        <TabsTrigger value="videos" className="flex items-center gap-2">
          <VideoIcon className="h-4 w-4" />
          Videos
        </TabsTrigger>
        <TabsTrigger value="by-us" className="flex items-center gap-2">
          <MusicIcon className="h-4 w-4" />
          By Us
        </TabsTrigger>
      </TabsList>

      {/* Pictures Tab */}
      <TabsContent value="pictures" className="mt-6">
        {pictures.length === 0 ? (
          <div className="text-center py-12">
            <p className="body-text text-muted">No pictures available yet.</p>
            <p className="body-text-sm text-muted-foreground mt-2">
              Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {transformPictures(pictures).map((item) => (
              <MediaCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </TabsContent>

      {/* Videos Tab */}
      <TabsContent value="videos" className="mt-6">
        {videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="body-text text-muted">No videos available yet.</p>
            <p className="body-text-sm text-muted-foreground mt-2">
              Add some videos through the Sanity Studio!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {transformVideos(videos)
              .filter(
                (item) =>
                  item.type === "video" &&
                  (item.coverImageUrl || item.animatedCoverImageUrl)
              ) // Only render if we have at least one image
              .map((item) => (
                <MediaCard key={item._id} item={item} />
              ))}
          </div>
        )}
      </TabsContent>

      {/* By Us Tab */}
      <TabsContent value="by-us" className="mt-6">
        {music.length === 0 ? (
          <div className="text-center py-12">
            <p className="body-text text-muted">
              No music tracks available yet.
            </p>
            <p className="body-text-sm text-muted-foreground mt-2">
              Add some tracks through the Sanity Studio!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {transformMusic(music).map((item) => (
              <MediaCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
