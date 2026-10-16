import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://opacweb.pt";

  return [
    {
      url: baseUrl,
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about/us`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about/you`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/media`,
      changeFrequency: "weekly", // Media content updates more frequently
      priority: 0.9,
    },
    {
      url: `${baseUrl}/radio`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "yearly", // Contact info changes rarely
      priority: 0.6,
    },
    {
      url: `${baseUrl}/a0ty`,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/cross`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    // Note: We don't include /studio as it's disallowed in robots.txt
    // Note: We don't include 404 pages or error pages in sitemap
  ];
}
