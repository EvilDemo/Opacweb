"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Image as ImageIcon,
  Video as VideoIcon,
  Music as MusicIcon,
  Radio as RadioIcon,
} from "lucide-react";
import NextImage from "next/image";
import {
  type Pictures,
  type Video,
  type Music,
  type Radio,
} from "@/lib/mediaData";

interface MediaTabsProps {
  pictures: Pictures[];
  videos: Video[];
  music: Music[];
  radio: Radio[];
}

export function MediaTabs({ pictures, videos, music, radio }: MediaTabsProps) {
  return (
    <Tabs defaultValue="pictures" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-2">
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
        <TabsTrigger value="radio" className="flex items-center gap-2">
          <RadioIcon className="h-4 w-4" />
          Radio
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {pictures.map((project) => (
              <Card
                key={project._id}
                className="overflow-hidden hover:shadow-lg transition-shadow pt-0 w-[280px] h-[280px]"
              >
                <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full">
                    <NextImage
                      src={project.thumbnailUrl}
                      alt={`${project.title} - ${project.description}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                      unoptimized={true}
                    />
                  </div>
                </div>
                <CardHeader className="px-3">
                  <CardTitle className="body-text-sm">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {project.description}
                  </CardDescription>
                </CardHeader>
              </Card>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {videos.map((video) => {
              // Videos have fallback + animated GIF logic
              // Priority: animatedCoverImage > coverImage
              const primaryImageUrl = video.animatedCoverImageUrl; // Animated (optional)
              const fallbackImageUrl = video.coverImageUrl; // Static (optional)

              // Only render if we have at least one valid image URL
              if (!fallbackImageUrl && !primaryImageUrl) {
                return null;
              }

              return (
                <Card
                  key={video._id}
                  className="overflow-hidden hover:shadow-lg transition-shadow pt-0 w-[280px] h-[280px]"
                >
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full">
                      <NextImage
                        src={fallbackImageUrl || primaryImageUrl || ""}
                        alt={`${video.title} - ${video.description}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                        unoptimized={true}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          console.log("Image loaded:", target.src);
                          console.log("Fallback URL:", fallbackImageUrl);
                          console.log("Primary URL:", primaryImageUrl);

                          // Mobile: always stay with fallback
                          if (window.innerWidth <= 768) {
                            console.log("Mobile device, staying with fallback");
                            return;
                          }

                          // Desktop: after fallback loads, try to load primary
                          if (
                            fallbackImageUrl &&
                            primaryImageUrl &&
                            fallbackImageUrl !== primaryImageUrl
                          ) {
                            console.log(
                              "Desktop: setting up primary image load with 3s delay"
                            );
                            // Add timeout to see the fallback first
                            setTimeout(() => {
                              console.log(
                                "3 seconds passed, starting primary image load"
                              );
                              const img = new window.Image();
                              img.onload = () => {
                                console.log(
                                  "Primary image loaded, switching to it"
                                );
                                target.src = primaryImageUrl;
                              };
                              img.onerror = () => {
                                console.log("Primary image failed to load");
                              };
                              img.src = primaryImageUrl;
                            }, 3000); // 3 second delay
                          } else {
                            console.log("Missing URLs or same URLs:", {
                              fallbackImageUrl,
                              primaryImageUrl,
                            });
                          }
                        }}
                        onError={(e) => {
                          // Still keep error fallback as backup
                          const target = e.target as HTMLImageElement;
                          if (fallbackImageUrl) {
                            target.src = fallbackImageUrl;
                          }
                        }}
                      />
                    </div>
                  </div>
                  <CardHeader className="px-3">
                    <CardTitle className="body-text-sm">
                      {video.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {video.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 pt-0">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full text-xs h-8"
                    >
                      <a
                        href={video.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Watch Video
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {music.map((track) => (
              <Card
                key={track._id}
                className="overflow-hidden hover:shadow-lg transition-shadow pt-0 w-[280px] h-[280px]"
              >
                <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full">
                    {track.coverImageUrl ? (
                      <NextImage
                        src={track.coverImageUrl}
                        alt={`${track.title} cover`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                        unoptimized={true}
                      />
                    ) : (
                      <MusicIcon className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <CardHeader className="px-3">
                  <CardTitle className="body-text-sm flex items-center gap-2">
                    <MusicIcon className="h-4 w-4 text-green-500" />
                    {track.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {track.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-3 pt-0">
                  <Button
                    asChild
                    className="w-full bg-green-600 hover:bg-green-700 text-xs h-8"
                  >
                    <a
                      href={track.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Listen on Spotify
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* Radio Tab */}
      <TabsContent value="radio" className="mt-6">
        {radio.length === 0 ? (
          <div className="text-center py-12">
            <p className="body-text text-muted">No radio available yet.</p>
            <p className="body-text-sm text-muted-foreground mt-2">
              Add some radio through the Sanity Studio!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {radio.map((playlist) => (
              <Card
                key={playlist._id}
                className="overflow-hidden hover:shadow-lg transition-shadow pt-0 w-[280px] h-[280px]"
              >
                <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full">
                    {playlist.coverImageUrl ? (
                      <NextImage
                        src={playlist.coverImageUrl}
                        alt={`${playlist.title} cover`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                        unoptimized={true}
                      />
                    ) : (
                      <RadioIcon className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <CardHeader className="px-3">
                  <CardTitle className="body-text-sm flex items-center gap-2">
                    <RadioIcon className="h-4 w-4 text-green-500" />
                    {playlist.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {playlist.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-3 pt-0">
                  <Button
                    asChild
                    className="w-full bg-green-600 hover:bg-green-700 text-xs h-8"
                  >
                    <a
                      href={playlist.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Playlist
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
