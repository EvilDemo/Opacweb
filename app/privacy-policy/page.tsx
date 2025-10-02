import React from "react";
import type { Metadata } from "next";
import { SmoothScrollLink } from "@/components/SmoothScrollLink";

export const metadata: Metadata = {
  title: "Privacy Policy | Opac",
  description:
    "Privacy Policy for opacweb.pt - Learn how we handle personal data, cookies, and your privacy rights.",
  keywords: [
    "privacy policy",
    "opac privacy",
    "data protection",
    "cookies",
    "personal data",
    "GDPR",
  ],
  authors: [{ name: "Opac" }],
  creator: "Opac",
  publisher: "Opac",
  openGraph: {
    title: "Privacy Policy | Opac",
    description:
      "Privacy Policy for opacweb.pt - Learn how we handle personal data and your privacy rights.",
    url: "https://opacweb.pt/privacy-policy",
    siteName: "Opac",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Opac Privacy Policy",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Opac",
    description:
      "Privacy Policy for opacweb.pt - Learn how we handle personal data.",
    images: ["/logo.webp"],
  },
  alternates: {
    canonical: "https://opacweb.pt/privacy-policy",
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

const PrivacyPolicyPage = () => {
  const tableOfContents = [
    { id: "who-we-are", title: "Who we are" },
    { id: "what-we-collect", title: "What we collect and why" },
    { id: "cookies-tracking", title: "Cookies and tracking" },
    { id: "data-sharing", title: "Data sharing and international transfers" },
    { id: "retention", title: "Retention" },
    { id: "your-rights", title: "Your rights" },
    { id: "security", title: "Security" },
    { id: "contact", title: "Contact" },
    { id: "changes", title: "Changes" },
  ];

  return (
    <div className="box-border flex flex-col gap-8 md:gap-12 items-start justify-start padding-global py-8 relative w-full min-h-fits mt-30">
      <div className="w-full">
        <h1 className="heading-1 mb-4">Privacy Policy</h1>
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
            <section id="who-we-are">
              <h2 className="heading-4 mb-4">1. Who we are</h2>
              <ul className="list-disc list-inside space-y-2 body-text">
                <li>
                  OPACWEB, [legal entity name], [registered address], Portugal
                </li>
                <li>Email for privacy requests: weareopac@gmail.com</li>
                <li>
                  This policy explains how we handle personal data on opacweb.pt
                </li>
              </ul>
            </section>

            <section id="what-we-collect">
              <h2 className="heading-4 mb-4">2. What we collect and why</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="body-text-lg font-semibold mb-2">
                    Orders and support
                  </h3>
                  <ul className="list-disc list-inside space-y-1 body-text ml-4">
                    <li>
                      Data: email, billing and shipping address, order details,
                      invoices
                    </li>
                    <li>
                      Purpose: fulfill purchases, provide support, invoicing and
                      tax
                    </li>
                    <li>
                      Legal basis: contract performance, legal obligation for
                      accounting
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="body-text-lg font-semibold mb-2">Payments</h3>
                  <ul className="list-disc list-inside space-y-1 body-text ml-4">
                    <li>
                      Processor: Webflow Ecommerce and its third party payment
                      providers
                    </li>
                    <li>We do not store full card details</li>
                    <li>
                      Legal basis: contract performance, legitimate interest in
                      fraud prevention
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="body-text-lg font-semibold mb-2">
                    Newsletter
                  </h3>
                  <ul className="list-disc list-inside space-y-1 body-text ml-4">
                    <li>Data: email address only</li>
                    <li>Purpose: send updates and news with your consent</li>
                    <li>
                      Legal basis: consent, you can unsubscribe at any time
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="body-text-lg font-semibold mb-2">
                    Analytics, cookie-less
                  </h3>
                  <ul className="list-disc list-inside space-y-1 body-text ml-4">
                    <li>Tool: Vercel Web Analytics</li>
                    <li>
                      Data: aggregated page views, referrers, device or browser
                      information, approximate location derived from IP
                    </li>
                    <li>Purpose: understand usage and improve the site</li>
                    <li>Legal basis: legitimate interest</li>
                  </ul>
                </div>

                <div>
                  <h3 className="body-text-lg font-semibold mb-2">
                    Server logs and security
                  </h3>
                  <ul className="list-disc list-inside space-y-1 body-text ml-4">
                    <li>
                      Data: IP address, user agent, request metadata, error logs
                    </li>
                    <li>Purpose: operate, secure, and debug the service</li>
                    <li>Legal basis: legitimate interest</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="cookies-tracking">
              <h2 className="heading-4 mb-4">3. Cookies and tracking</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="body-text-lg font-semibold mb-2">
                    Essential cookies
                  </h3>
                  <p className="body-text">
                    Our shop uses essential cookies for cart, checkout, and
                    session integrity. These are necessary for the site to
                    function and do not require consent under ePrivacy rules.
                  </p>
                </div>

                <div>
                  <h3 className="body-text-lg font-semibold mb-2">
                    Non-essential cookies
                  </h3>
                  <p className="body-text">
                    We do not use marketing cookies. Our analytics is
                    cookie-less and does not set identifiers.
                  </p>
                </div>

                <p className="body-text">
                  If this changes, we will update this policy and request
                  consent where required.
                </p>
              </div>
            </section>

            <section id="data-sharing">
              <h2 className="heading-4 mb-4">
                4. Data sharing and international transfers
              </h2>
              <p className="body-text">
                We share data with service providers acting as processors,
                including Webflow hosting and ecommerce, payment providers used
                by Webflow, our email or newsletter provider if used, email
                delivery, and Vercel for analytics.
              </p>
              <p className="body-text mt-4">
                Some providers are outside the EU. Transfers are protected by
                mechanisms such as the EU US Data Privacy Framework and Standard
                Contractual Clauses.
              </p>
            </section>

            <section id="retention">
              <h2 className="heading-4 mb-4">5. Retention</h2>
              <ul className="list-disc list-inside space-y-2 body-text">
                <li>
                  Orders and invoices: kept as required by Portuguese tax law,
                  typically 10 years
                </li>
                <li>
                  Newsletter data: kept until you unsubscribe or request
                  deletion
                </li>
                <li>Logs and analytics: typically up to 12 months</li>
              </ul>
            </section>

            <section id="your-rights">
              <h2 className="heading-4 mb-4">6. Your rights</h2>
              <p className="body-text">
                You may request access, rectification, erasure, restriction,
                portability, and object to processing based on legitimate
                interests. You can withdraw consent at any time for the
                newsletter.
              </p>
              <p className="body-text mt-4">
                To exercise rights, email weareopac@gmail.com
              </p>
              <p className="body-text mt-4">
                You can lodge a complaint with the Portuguese Data Protection
                Authority, CNPD.
              </p>
            </section>

            <section id="security">
              <h2 className="heading-4 mb-4">7. Security</h2>
              <p className="body-text">
                We use HTTPS, access controls, and limit access to personal data
                to those who need it.
              </p>
            </section>

            <section id="contact">
              <h2 className="heading-4 mb-4">8. Contact</h2>
              <ul className="list-disc list-inside space-y-2 body-text">
                <li>OPACWEB, [registered address], Portugal</li>
                <li>Email: weareopac@gmail.com</li>
              </ul>
            </section>

            <section id="changes">
              <h2 className="heading-4 mb-4">9. Changes</h2>
              <p className="body-text">
                We will post updates here with a new effective date.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
