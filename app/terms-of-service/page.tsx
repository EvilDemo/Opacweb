import React from "react";
import type { Metadata } from "next";
import { SmoothScrollLink } from "@/components/SmoothScrollLink";

export const metadata: Metadata = {
  title: "Terms of Service | Opac",
  description:
    "Terms of Service for opacweb.pt - Learn about our terms, conditions, and policies for using our website and shop.",
  keywords: [
    "terms of service",
    "opac terms",
    "website terms",
    "shop terms",
    "user agreement",
    "terms and conditions",
  ],
  authors: [{ name: "Opac" }],
  creator: "Opac",
  publisher: "Opac",
  openGraph: {
    title: "Terms of Service | Opac",
    description:
      "Terms of Service for opacweb.pt - Learn about our terms and conditions for using our website and shop.",
    url: "https://opacweb.pt/terms-of-service",
    siteName: "Opac",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Opac Terms of Service",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | Opac",
    description:
      "Terms of Service for opacweb.pt - Learn about our terms and conditions.",
    images: ["/logo.webp"],
  },
  alternates: {
    canonical: "https://opacweb.pt/terms-of-service",
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

const TermsOfServicePage = () => {
  const tableOfContents = [
    { id: "about-us", title: "About us" },
    { id: "scope", title: "Scope" },
    { id: "products-pricing", title: "Products, pricing, and taxes" },
    { id: "orders-contract", title: "Orders and contract" },
    { id: "payment", title: "Payment" },
    { id: "shipping-delivery", title: "Shipping and delivery" },
    { id: "digital-goods", title: "Digital goods or services, if applicable" },
    {
      id: "right-withdrawal",
      title: "Right of withdrawal and returns for EU consumers",
    },
    { id: "warranty-defects", title: "Warranty and defects" },
    { id: "acceptable-use", title: "Acceptable use" },
    { id: "intellectual-property", title: "Intellectual property" },
    { id: "liability", title: "Liability" },
    { id: "changes", title: "Changes" },
    { id: "contact", title: "Contact" },
  ];

  return (
    <div className="box-border flex flex-col gap-8 md:gap-12 items-start justify-start padding-global py-8 relative w-full min-h-fits mt-30">
      <div className="w-full">
        <h1 className="heading-1 mb-4">Terms of Service</h1>
        <p className="body-text-sm text-neutral-600">
          Effective date: October 3, 2025
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 w-full">
        {/* Table of Contents - 1/3 */}
        <div className="lg:col-span-1">
          <div className="sticky top-28">
            <div className="bg-gradient-to-br from-neutral-900 to-black text-white flex flex-col rounded-2xl border border-neutral-800 py-4 px-4 shadow-sm overflow-hidden group relative hover:shadow-lg hover:-translate-y-1 hover:border-neutral-600 hover:bg-neutral-800 transition-all duration-300 ease-in-out">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                {/* Color overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/25 to-emerald-400/25 rounded-2xl" />
              </div>

              {/* Decorative Elements */}
              <div className="absolute bottom-1/4 -right-4 w-16 h-16 rounded-full bg-white/10 blur-xl"></div>
              <div className="absolute bottom-4 -left-4 w-20 h-20 rounded-full bg-white/8 blur-2xl"></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="mb-4">
                  <h3 className="text-white font-semibold leading-none">
                    Table of Contents
                  </h3>
                </div>
                <div className="space-y-2">
                  {tableOfContents.map((item) => (
                    <SmoothScrollLink
                      key={item.id}
                      href={`#${item.id}`}
                      className="block text-sm text-neutral-300 hover:text-white py-1 hover:translate-x-1 transform transition-all duration-200"
                    >
                      {item.title}
                    </SmoothScrollLink>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content - 2/3 */}
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-6 md:gap-8 items-start justify-start relative w-full">
            <section id="about-us">
              <h2 className="heading-4 mb-4">1. About us</h2>
              <ul className="list-disc list-inside space-y-2 body-text">
                <li>OPACWEB, [legal entity name], [address], Portugal</li>
                <li>Contact: weareopac@gmail.com</li>
                <li>Governing law: Portugal</li>
              </ul>
            </section>

            <section id="scope">
              <h2 className="heading-4 mb-4">2. Scope</h2>
              <p className="body-text">
                These Terms govern your use of opacweb.pt and purchases made
                through our shop.
              </p>
            </section>

            <section id="products-pricing">
              <h2 className="heading-4 mb-4">
                3. Products, pricing, and taxes
              </h2>
              <ul className="list-disc list-inside space-y-2 body-text">
                <li>
                  Prices are shown in euros, Portuguese VAT applied where
                  required.
                </li>
                <li>
                  We may update prices at any time before you place an order.
                </li>
              </ul>
            </section>

            <section id="orders-contract">
              <h2 className="heading-4 mb-4">4. Orders and contract</h2>
              <ul className="list-disc list-inside space-y-2 body-text">
                <li>Your order is an offer to buy.</li>
                <li>
                  A contract is formed when we email you an order confirmation.
                </li>
                <li>
                  We may cancel or refuse an order, for example suspected fraud,
                  errors, or unavailability. If payment was taken, we will
                  refund you.
                </li>
              </ul>
            </section>

            <section id="payment">
              <h2 className="heading-4 mb-4">5. Payment</h2>
              <ul className="list-disc list-inside space-y-2 body-text">
                <li>
                  Payments are processed securely by Webflow Ecommerce and its
                  payment providers.
                </li>
                <li>We do not store full card details.</li>
              </ul>
            </section>

            <section id="shipping-delivery">
              <h2 className="heading-4 mb-4">6. Shipping and delivery</h2>
              <ul className="list-disc list-inside space-y-2 body-text">
                <li>
                  We ship to Portugal. Exceptions can be made on request, please
                  contact us before ordering.
                </li>
                <li>
                  Estimated delivery times are provided at checkout or in your
                  confirmation email.
                </li>
                <li>Risk passes on delivery to the address you provide.</li>
              </ul>
            </section>

            <section id="digital-goods">
              <h2 className="heading-4 mb-4">
                7. Digital goods or services, if applicable
              </h2>
              <p className="body-text">
                If you purchase digital content delivered immediately, you agree
                that the 14 day withdrawal right ends once delivery starts.
              </p>
            </section>

            <section id="right-withdrawal">
              <h2 className="heading-4 mb-4">
                8. Right of withdrawal and returns for EU consumers
              </h2>
              <ul className="list-disc list-inside space-y-2 body-text">
                <li>
                  You have 14 days from delivery to withdraw without reason,
                  except custom made items or sealed items not suitable for
                  return once opened.
                </li>
                <li>
                  To start a return, email weareopac@gmail.com with your order
                  number.
                </li>
                <li>
                  Refunds are made within 14 days after we receive the returned
                  items or proof of return, using the original payment method.
                  You may be responsible for return shipping unless the item is
                  defective.
                </li>
              </ul>
            </section>

            <section id="warranty-defects">
              <h2 className="heading-4 mb-4">9. Warranty and defects</h2>
              <p className="body-text">
                Statutory warranty rights apply. If an item is defective or not
                as described, contact us promptly.
              </p>
            </section>

            <section id="acceptable-use">
              <h2 className="heading-4 mb-4">10. Acceptable use</h2>
              <p className="body-text">
                Do not misuse the site or interfere with its security or
                operation.
              </p>
            </section>

            <section id="intellectual-property">
              <h2 className="heading-4 mb-4">11. Intellectual property</h2>
              <p className="body-text">
                Site content is owned by OPACWEB or its licensors. You receive a
                limited, non exclusive, non transferable license to use the
                site.
              </p>
            </section>

            <section id="liability">
              <h2 className="heading-4 mb-4">12. Liability</h2>
              <ul className="list-disc list-inside space-y-2 body-text">
                <li>
                  To the extent permitted by law, we are not liable for indirect
                  or consequential losses, including lost profits or data.
                </li>
                <li>
                  Nothing limits liability that cannot be limited by law,
                  including for fraud or gross negligence.
                </li>
              </ul>
            </section>

            <section id="changes">
              <h2 className="heading-4 mb-4">13. Changes</h2>
              <p className="body-text">
                We may update these Terms. We will post the effective date.
                Continued use after changes means you accept the updated Terms.
              </p>
            </section>

            <section id="contact">
              <h2 className="heading-4 mb-4">14. Contact</h2>
              <ul className="list-disc list-inside space-y-2 body-text">
                <li>OPACWEB, [address], Portugal</li>
                <li>Email: weareopac@gmail.com</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
