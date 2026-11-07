import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { ImageResponse } from "next/og";
import { formatMoney } from "@/lib/format";
import { shareImage } from "@/lib/seo";
import { getStorefront } from "@/lib/storefront";

const size = { width: 1200, height: 630 };
const MIME: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

/**
 * Share card for Facebook / WhatsApp / Messenger / X. File-based OG images take
 * priority over generateMetadata, so this card is product-aware: it uses the
 * admin-set SEO image or the first real product photo. Text stays Latin-only
 * because the default OG font has no Bengali glyphs.
 */
export async function generateImageMetadata() {
  const { product, settings } = await getStorefront();
  return [
    {
      id: "share",
      size,
      contentType: "image/png",
      alt: product ? `${product.title} — ${settings.brandName}` : `${settings.brandName} watches`,
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
  const { product, settings } = await getStorefront();
  const photo = product ? await photoSrc(shareImage(product)) : undefined;
  const prices = product?.variants.map((v) => v.price) ?? [];
  const from = prices.length ? Math.min(...prices) : product?.price;
  const movement = product?.specs.movement?.split(/\s[—(]/)[0]?.trim().toLowerCase();
  const subtitle = `Men's ${movement && /^[\x20-\x7E]+$/.test(movement) ? `${movement} ` : ""}watch`;
  const colours = product && product.variants.length > 1 ? product.variants.map((v) => v.name).join(" · ") : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #fbf9f4 0%, #f1eadf 60%, #e4d9c6 100%)",
          color: "#17140f",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: 8, color: "#7a5a2b" }}>
            {settings.brandName.toUpperCase()}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: product ? 84 : 104, lineHeight: 1 }}>{product?.title ?? "Time, quietly"}</div>
            {product ? (
              <div style={{ display: "flex", marginTop: 18, fontSize: 32, fontStyle: "italic", color: "#4a443b" }}>
                {subtitle}
              </div>
            ) : (
              <div style={{ fontSize: 104, lineHeight: 1, fontStyle: "italic", color: "#4a443b" }}>well kept.</div>
            )}
            {colours ? (
              <div style={{ display: "flex", marginTop: 14, fontSize: 24, color: "#7d766b" }}>{colours}</div>
            ) : null}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24, whiteSpace: "nowrap" }}>
            {from ? (
              <div style={{ display: "flex", fontSize: 36, whiteSpace: "nowrap" }}>
                {`From ${formatMoney(from, { ...settings.currency, symbol: settings.currency.code === "BDT" ? "Tk " : settings.currency.symbol })}`}
              </div>
            ) : null}
            {settings.codEnabled ? (
              <div
                style={{
                  display: "flex",
                  padding: "10px 18px",
                  border: "2px solid #b8955c",
                  fontSize: 20,
                  letterSpacing: 2,
                  whiteSpace: "nowrap",
                  color: "#7a5a2b",
                }}
              >
                CASH ON DELIVERY
              </div>
            ) : null}
          </div>
        </div>
        {photo ? (
          <img src={photo} alt="" width={560} height={630} style={{ width: 560, height: 630, objectFit: "cover" }} />
        ) : null}
      </div>
    ),
    size,
  );
}
