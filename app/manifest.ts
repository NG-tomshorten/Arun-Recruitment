import type { MetadataRoute } from "next";

// Metadata routes must declare themselves static under `output: 'export'`.
export const dynamic = "force-static";

/** Web app manifest (PLAN §13 step 6). Colours are the chalk/channel tokens. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Arun Language Training & Recruitment",
    short_name: "Arun",
    description:
      "Teacher recruitment from West Sussex: English teachers placed in Taiwan and mainland China.",
    start_url: "/",
    display: "browser",
    background_color: "#FAF7F2",
    theme_color: "#122E36",
    icons: [
      { src: "/images/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/images/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
