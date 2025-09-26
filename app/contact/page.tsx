import { Metadata } from "next";
import ContactPageClient from "@/components/ContactPageClient";
import ContactCTA from "@/components/ContactCTA";

export const metadata: Metadata = {
  title: "Contact Opac | Get in Touch",
  description:
    "Connect with Opac. Reach out via phone at +351 915 006 659 or email at weareopac@gmail.com for collaborations, inquiries, and creative partnerships.",
  keywords: [
    "contact opac",
    "get in touch",
    "collaboration",
    "inquiries",
    "creative partnerships",
    "portugal contact",
  ],
  authors: [{ name: "Opac" }],
  creator: "Opac",
  publisher: "Opac",
  openGraph: {
    title: "Contact Opac | Get in Touch",
    description:
      "Connect with Opac for collaborations, inquiries, and creative partnerships. Phone: +351 915 006 659 | Email: weareopac@gmail.com",
    url: "https://weareopac.com/contact",
    siteName: "Opac",
    images: [
      {
        url: "/og-contact.jpg",
        width: 1200,
        height: 630,
        alt: "Contact Opac - Get in Touch",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Opac | Get in Touch",
    description:
      "Connect with Opac for collaborations and creative partnerships.",
    images: ["/twitter-contact.jpg"],
  },
  alternates: {
    canonical: "https://weareopac.com/contact",
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

export default function ContactPage() {
  return (
    <>
      <ContactPageClient />
      <ContactCTA />
    </>
  );
}
