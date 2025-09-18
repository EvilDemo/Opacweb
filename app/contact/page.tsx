import { Metadata } from "next";
import Form from "@/components/Form";

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
    <main>
      <div className="h-[80vh] container mx-auto padding-global grid grid-cols-2 place-items-center gap-10">
        <div className="flex flex-col gap-5">
          <p className="body-text-lg font-bold">
            Feel free to reach us using any of the following methods:
          </p>
          <ul className="flex flex-col gap-2">
            <li>
              Tel:
              <a
                href="tel:+351915006659"
                className="text-blue-500 hover:text-blue-700 underline underline-offset-1 hover:underline-offset-0"
              >
                +351 915 006 659
              </a>
            </li>
            <li>
              Email:
              <a
                href="mailto:weareopac@gmail.com"
                className="text-blue-500 hover:text-blue-700 underline underline-offset-1 hover:underline-offset-0"
              >
                weareopac@gmail.com
              </a>
            </li>
          </ul>
        </div>
        <Form />
      </div>
    </main>
  );
}
