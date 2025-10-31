import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProductView } from "@/components/commerce/ProductView";
import { getProductByHandle, isShopifyConfigured } from "@/lib/shopify";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductByHandle(slug);

  if (!product) {
    return {
      title: "Product Not Found | Opac",
    };
  }

  const firstImage = product.images[0];

  return {
    title: `${product.title} | Opac Shop`,
    description: product.description || `Shop ${product.title} at Opac`,
    openGraph: {
      title: product.title,
      description: product.description || `Shop ${product.title} at Opac`,
      images: firstImage
        ? [
            {
              url: firstImage.url,
              width: firstImage.width,
              height: firstImage.height,
              alt: firstImage.altText || product.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.description || `Shop ${product.title} at Opac`,
      images: firstImage ? [firstImage.url] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  if (!isShopifyConfigured()) {
    redirect("/shop");
  }

  const product = await getProductByHandle(slug);

  if (!product) {
    notFound();
  }

  return (
    <section className="bg-black text-white min-h-[calc(100vh-6rem)]">
      <ProductView product={product} />
    </section>
  );
}

