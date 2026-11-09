import type { MetadataRoute } from "next";

// Formwork is a fictional portfolio demo, so the whole site is kept out of search indexes.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", disallow: "/" }] };
}
