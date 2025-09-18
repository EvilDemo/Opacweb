"use client";

import { useEffect, useState } from "react";
import { getRadio, type Radio } from "@/lib/mediaData";
import { MediaCard, type MediaItem } from "@/components/MediaCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Radio as RadioIcon } from "lucide-react";

// Helper function to transform radio data to MediaCard format
const transformRadio = (radio: Radio[]): MediaItem[] =>
  radio.map((item) => ({ ...item, type: "radio" as const }));

export function RadioPageContent() {
  const [radio, setRadio] = useState<Radio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRadioData() {
      try {
        const radioData = await getRadio();
        setRadio(radioData);
      } catch (error) {
        console.error("Error fetching radio data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRadioData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] px-4 sm:px-8 md:px-12 lg:px-16 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <RadioIcon className="h-8 w-8 text-green-500" />
          <h1 className="heading-2">Radio</h1>
        </div>
        <p className="body-text text-muted max-w-2xl">
          Discover our curated playlists and radio shows. Experience our musical
          curation and explore sounds that resonate with our artistic vision.
        </p>
      </div>

      {/* Radio Content */}
      {radio.length === 0 ? (
        <div className="text-center py-12">
          <RadioIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="body-text text-muted">
            No radio content available yet.
          </p>
          <p className="body-text-sm text-muted-foreground mt-2">
            Check back soon for our curated playlists and radio shows!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {transformRadio(radio).map((item) => (
            <MediaCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
