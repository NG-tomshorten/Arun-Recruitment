import type { MetadataRoute } from "next";
import { fetchShownJobs } from "@/lib/jobs";
import { SITE_URL } from "@/lib/site";

// Metadata routes must declare themselves static under `output: 'export'`.
export const dynamic = "force-static";

/**
 * sitemap.xml (PLAN §9), generated at build time. Excluded on purpose:
 * hidden placements (noindexed, like /admin), the dev-only /styleguide,
 * and the deliberately dead /gdpr-consent.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    "",
    "/jobs",
    "/profile",
    "/for-employers",
    "/contact",
    "/privacy",
  ].map((path) => ({ url: `${SITE_URL}${path}` }));

  const placements: MetadataRoute.Sitemap = (await fetchShownJobs()).map(
    (job) => ({
      url: `${SITE_URL}/jobs/${job.slug}`,
      lastModified: new Date(job.postedDate),
    }),
  );

  return [...pages, ...placements];
}
