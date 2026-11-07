import type { MetadataRoute } from "next";
import { getStorefront } from "@/lib/storefront";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { settings } = await getStorefront();
  return {
    name: settings.brandName,
    short_name: settings.brandName,
    description: settings.hero.subheadline || `${settings.brandName} watches`,
    start_url: "/",
    display: "browser",
    background_color: "#f6f2ea",
    theme_color: "#f6f2ea",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
