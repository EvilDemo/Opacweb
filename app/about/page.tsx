"use client";

import { useRef } from "react";

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  const heroLines = [
    "Embracing individuality.",
    "Embrace the difference.",
    "It's nothing. It's everything.",
  ];

  const manifestoText = [
    "We are not here to fill silence.",
    "We are here to bend it.",
    "Music is the signal.",
    "Clothing is the carrier.",
    "Together they create residue,",
    "a trace of something unspoken.",
  ];

  const mandates = [
    { title: "Unspoken", description: "What you don't say matters more." },
    { title: "Opacity", description: "Mystery is the interface." },
    {
      title: "Utility",
      description: "Every seam, every sound, has a function.",
    },
    { title: "Ritual", description: "Drops are gatherings, not transactions." },
    { title: "Longevity", description: "No seasons, only chapters." },
    { title: "Signal", description: "Every piece carries a frequency." },
  ];

  return (
    <main className="bg-black text-white min-h-screen">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="h-screen flex flex-col justify-center items-center relative overflow-hidden"
      >
        <div className="space-y-8 text-center">
          {heroLines.map((line, index) => (
            <div
              key={index}
              className="text-6xl md:text-8xl font-bold tracking-tight opacity-0 animate-fade-in"
              style={{
                animationDelay: `${index * 0.3}s`,
                animationFillMode: "forwards",
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="py-32 px-8 md:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6 text-center">
            {manifestoText.map((line, index) => (
              <p
                key={index}
                className="text-2xl md:text-3xl font-light leading-relaxed"
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Six Mandates Section */}
      <section className="py-32 px-8 md:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {mandates.map((mandate, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {mandate.title}
                </h3>
                <p className="text-lg md:text-xl font-light leading-relaxed">
                  {mandate.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing Visual Section */}
      <section className="relative h-screen">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black">
          {/* Placeholder for full-bleed image */}
          <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black opacity-60" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-4xl px-8">
              Wear the signal.
              <br />
              Become the frequency.
            </p>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </main>
  );
}
