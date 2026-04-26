import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "QR Code Generator",
    short_name: "QR Code",
    description:
      "Generate customizable QR codes for any URL or text and download them as PNG images.",
    start_url: "/",
    display: "standalone",
    display_override: ["standalone", "browser"],
    background_color: "#fafafc",
    theme_color: "#0a0a0a",
    orientation: "any",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
