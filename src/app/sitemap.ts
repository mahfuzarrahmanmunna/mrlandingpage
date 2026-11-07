import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { absoluteUrl, seoDescription } from "@/lib/seo";
import { getStorefront } from "@/lib/storefront";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const { product, settings } = await getStorefront();
  // Preview/demo content is noindex, so it is not listed either.
  if (!product || product.isDemo) return [{ url: `${base}/`, changeFrequency: "weekly", priority: 1 }];

  const photos = [...product.images, ...product.variants.flatMap((v) => v.images)].filter((i) => !i.placeholder);
  const images = [...new Set(photos.map((i) => absoluteUrl(i.url)))];

  return [
    {
      url: `${base}/`,
      ...(product.updatedAt ? { lastModified: product.updatedAt } : {}),
      changeFrequency: "weekly",
      priority: 1,
      images,
      ...(product.videoUrl && images[0]
        ? {
            videos: [
              {
                title: `${product.title} — product video`,
                description: seoDescription(product, settings),
                thumbnail_loc: images[0],
                content_loc: absoluteUrl(product.videoUrl),
                ...(product.updatedAt ? { publication_date: product.updatedAt } : {}),
                family_friendly: "yes" as const,
              },
            ],
          }
        : {}),
    },
  ];
}
