"use client";

import { useState } from "react";

interface Service {
  id: string;
  number: string;
  title: string;
  subheading: string;
  features: string[];
  description: string;
  image?: string;
}

const services: Service[] = [
  {
    id: "01",
    number: "001",
    title: "Music Production",
    subheading: "Crafting sonic experiences",
    features: ["Sound Design", "Music Composition", "Audio Mixing", "Mastering & Post-Production"],
    description:
      "From concept to completion, we produce original music that elevates your artistic vision and resonates with your audience.",
  },
  {
    id: "02",
    number: "002",
    title: "Merchandise Design",
    subheading: "Wearable art & collectibles",
    features: ["Product Design", "Graphic Development", "Manufacturing Coordination", "Quality Control"],
    description:
      "We design and produce high-quality merchandise that extends your brand identity into tangible, collectible pieces.",
  },
  {
    id: "03",
    number: "003",
    title: "Branding",
    subheading: "Identity that resonates",
    features: ["Brand Strategy", "Visual Identity", "Logo Design", "Brand Guidelines"],
    description:
      "Creating cohesive brand identities that capture the essence of your vision and stand out in the cultural landscape.",
  },
  {
    id: "04",
    number: "004",
    title: "Photography & Art Direction",
    subheading: "Visual storytelling & direction",
    features: ["Creative Direction", "Photography", "Videoclip Production", "Visual Storytelling"],
    description:
      "Compelling visual narratives that capture attention and communicate your story through powerful imagery, videoclips, and art direction.",
  },
];

export default function ServicesSection() {
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  return (
    <section className="padding-global min-h-[calc(100vh-6rem)] flex flex-col justify-center gap-8 md:gap-12 ">
      {/* Section Header */}
      <div>
        <h2 className="heading-2 mb-4">
          Inspired by you, <br />
          created by me.
        </h2>
        <p className="body-text-sm text-muted text-pretty max-w-xl">
          What we offer is simple, make it memorable. Music production, merchandise, branding, and art direction,
          delivered with precision and taste.
        </p>
      </div>

      {/* Services Cards Container */}
      <div className="relative">
        {/* Mobile: Vertical Stack */}
        <div className="flex flex-col lg:flex-row gap-4">
          {services.map((service) => {
            const isHovered = hoveredService === service.id;
            const isAnyHovered = hoveredService !== null;
            const isOtherHovered = isAnyHovered && !isHovered;

            return (
              <div
                key={service.id}
                onMouseEnter={() => setHoveredService(service.id)}
                onMouseLeave={() => setHoveredService(null)}
                className={`
                  relative
                  bg-gradient-to-br from-neutral-900 to-black
                  border border-neutral-800
                  rounded-2xl
                  transition-all duration-[800ms] ease-[cubic-bezier(0.11,0.82,0.39,0.92)]
                  overflow-hidden
                  group
                  hover:border-neutral-600
                  service-card
                  lg:h-[350px]
                  ${isHovered ? "service-card-hovered" : ""}
                  ${isOtherHovered ? "service-card-other-hovered" : ""}
                `}
                style={{
                  flex: isHovered ? "1 1 50%" : isOtherHovered ? "1 1 16.66%" : "1 1 25%",
                  minWidth: isOtherHovered ? "150px" : "200px",
                }}
              >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  {/* Color overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/25 to-emerald-400/25 rounded-2xl" />
                </div>

                {/* Decorative blur elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10 blur-xl"></div>
                <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/5 blur-2xl"></div>

                {/* Content wrapper with z-index */}
                <div className="relative z-10 px-8 pt-8 pb-6 lg:px-6 lg:pt-6 lg:pb-0 flex flex-col gap-6 h-full">
                  {/* Number - Always visible */}
                  <div className="flex flex-col gap-2">
                    <span className="body-text-sm-md text-muted">{service.number}</span>
                    <h1 className="heading-3 text-white">{service.title}</h1>
                  </div>

                  {/* Expanded Content - Always visible on mobile, hover on desktop */}
                  <div
                    className={`
                    flex flex-col gap-4 flex-1 mt-[-16px]
                    opacity-100 lg:opacity-0
                    ${
                      isHovered
                        ? "lg:opacity-100 lg:transition-opacity lg:duration-[600ms] lg:ease-[cubic-bezier(0.11,0.82,0.39,0.92)]"
                        : "lg:pointer-events-none"
                    }
                  `}
                  >
                    {/* Subheading */}
                    <h2 className="body-text-lg !font-medium text-muted">{service.subheading}</h2>

                    {/* Features List */}
                    <ul className="flex flex-col gap-1">
                      {service.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="body-text-sm text-neutral-400 flex items-start gap-2"
                          style={{
                            animation: isHovered ? `fadeInUp 0.4s ease-out ${idx * 0.1}s both` : "none",
                          }}
                        >
                          <span className="text-neutral-500">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Description */}
                    <p
                      className="body-text-sm text-muted"
                      style={{
                        animation: isHovered ? "fadeInUp 0.4s ease-out 0.5s both" : "none",
                      }}
                    >
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Hover indicator line at bottom - positioned relative to card */}
                <div
                  className={`
                  absolute bottom-0 left-0 right-0 h-[2px] z-20
                  bg-gradient-to-r from-transparent via-white to-transparent
                  transition-all duration-[800ms] ease-[cubic-bezier(0.11,0.82,0.39,0.92)]
                  ${isHovered ? "opacity-100" : "opacity-0"}
                `}
                />
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Mobile: Full width, no hover effects */
        @media (max-width: 1023px) {
          .service-card {
            width: 100% !important;
            flex: 1 1 100% !important;
            min-width: 100% !important;
          }
        }

        /* Responsive flex adjustments for lg and xl screens */
        @media (min-width: 1024px) and (max-width: 1535px) {
          .service-card-hovered {
            flex: 1 1 42% !important;
          }
          .service-card-other-hovered {
            flex: 1 1 19.33% !important;
          }
        }
      `}</style>
    </section>
  );
}
