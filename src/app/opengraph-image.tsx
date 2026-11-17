import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { ImageResponse } from "next/og";
import { shareImage } from "@/lib/seo";
import { getStorefront } from "@/lib/storefront";

const size = { width: 1200, height: 630 };
const MIME: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

/**
 * Share card for Facebook / WhatsApp / Messenger / X. File-based OG images take
 * priority over generateMetadata, so this card is product-aware: it uses the
 * admin-set SEO image or the first real product photo.
 *
 * The card is photo-only on purpose: the site is Bangla-only, and the OG image
 * renderer cannot shape Bangla text (joined letters come out broken). The
 * Bangla title and price travel in the page's og:title / og:description.
 */
export async function generateImageMetadata() {
  const { product, settings } = await getStorefront();
  return [
    {
      id: "share",
      size,
      contentType: "image/png",
      alt: product ? `${product.title} — ${settings.brandName}` : `${settings.brandName} — ঘড়ি`,
    },
  ];
}

/** Inline local /public images as data URIs; pass remote URLs through. */
async function photoSrc(url: string | undefined) {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  const mime = MIME[extname(url).toLowerCase()];
  if (!mime) return undefined;
  const publicDir = join(process.cwd(), "public");
  const file = normalize(join(publicDir, url));
  if (!file.startsWith(publicDir)) return undefined;
  try {
    return `data:${mime};base64,${(await readFile(file)).toString("base64")}`;
  } catch {
    return undefined;
  }
}

export default async function OpengraphImage() {
  const { product } = await getStorefront();
  const photo = product ? await photoSrc(shareImage(product)) : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fbf9f4 0%, #f1eadf 60%, #e4d9c6 100%)",
        }}
      >
        {photo ? (
          <img
            src={photo}
            alt=""
            width={630}
            height={630}
            style={{ width: 630, height: 630, objectFit: "cover", borderLeft: "6px solid #b8955c", borderRight: "6px solid #b8955c" }}
          />
        ) : (
          <div style={{ display: "flex", width: 220, height: 220, borderRadius: 220, border: "6px solid #b8955c" }} />
        )}
      </div>
    ),
    size,
  );
}
