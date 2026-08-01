import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static output — no Next server runtime in production (PLAN §1).
  output: "export",
  // Image optimization doesn't run under static export; images are pre-sized and committed.
  images: { unoptimized: true },
};

export default nextConfig;
