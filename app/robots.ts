import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Metadata routes must declare themselves static under `output: 'export'`.
export const dynamic = "force-static";

/** robots.txt (PLAN §9): disallow the Tina admin; point at the sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/admin/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
