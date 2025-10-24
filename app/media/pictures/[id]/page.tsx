import type { Metadata } from "next";
import { getPictures, getGallery } from "@/lib/mediaData";
import { notFound } from "next/navigation";
import PictureGalleryContent from "@/components/PictureGalleryContent";

// Use Next.js default caching - data layer handles the actual caching
// export const dynamic = "force-dynamic"; // Removed to allow bfcache
// export const revalidate = 0; // Removed to allow bfcache

interface PicturePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PicturePageProps): Promise<Metadata> {
  const { id } = await params;
  const [allPictures, gallery] = await Promise.all([getPictures(), getGallery(id)]);

  const picture = allPictures.find((p) => p._id === id);

  if (!picture) {
    return {
      title: "Picture Gallery Not Found | Opac Media",
      description: "The requested picture gallery could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const imageCount = (gallery?.gallery?.length || 0) + 1; // +1 for thumbnail

  return {
    title: `${picture.title} - Picture Gallery | Opac Media`,
    description: `${picture.description} View all ${imageCount} images in this gallery.`,
    keywords: [
      "opac pictures",
      "photo gallery",
      picture.title.toLowerCase(),
      "opac media",
      "photography",
      "visual content",
    ],
    authors: [{ name: "Opac" }],
    creator: "Opac",
    publisher: "Opac",
    openGraph: {
      title: `${picture.title} | Opac Picture Gallery`,
      description: `${picture.description} Explore ${imageCount} images in this collection.`,
      url: `https://opacweb.pt/media/pictures/${id}`,
      siteName: "Opac",
      images: [
        {
          url: picture.thumbnailUrl,
          width: 1200,
          height: 630,
          alt: `${picture.title} - Gallery thumbnail`,
        },
        ...(gallery?.gallery?.slice(0, 3).map((url, index) => ({
          url,
          width: 1200,
          height: 630,
          alt: `${picture.title} - Image ${index + 2}`,
        })) || []),
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${picture.title} | Opac Picture Gallery`,
      description: `${picture.description}`,
      images: [picture.thumbnailUrl],
    },
    alternates: {
      canonical: `https://opacweb.pt/media/pictures/${id}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function PicturePage({ params }: PicturePageProps) {
  const { id } = await params;
  const [allPictures, gallery] = await Promise.all([getPictures(), getGallery(id)]);

  const picture = allPictures.find((p) => p._id === id);

  if (!picture) {
    notFound();
  }

  return <PictureGalleryContent picture={picture} gallery={gallery} />;
}
