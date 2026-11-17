import "server-only";
import { siteUrl } from "@/lib/env";
import { bnMoney } from "@/lib/format";
import type { PublicProduct, PublicSettings } from "@/lib/types";

/** Absolute URL for a site-relative path (leaves absolute URLs untouched). */
export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl()}${path.startsWith("/") ? "" : "/"}${path}`;
}

function clip(text: string, max: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20)).replace(/[,.;:—\s-]+$/, "")}…`;
}

function lowestPrice(product: PublicProduct) {
  const prices = product.variants.map((v) => v.price).filter((p) => p > 0);
  return prices.length ? Math.min(...prices) : product.price;
}

function isBangladesh(settings: PublicSettings) {
  return settings.currency.code === "BDT";
}

const hasWord = (text: string, re: RegExp) => re.test(text);

export function seoTitle(product: PublicProduct, settings: PublicSettings) {
  if (product.seo.title) return product.seo.title;
  const name = hasWord(product.title, /ঘড়ি|watch/i) ? product.title : `${product.title} ঘড়ি`;
  const where = isBangladesh(settings) ? " — বাংলাদেশে দাম" : "";
  return clip(`${name}${where} | ${settings.brandName}`, 65);
}

export function seoDescription(product: PublicProduct, settings: PublicSettings) {
  if (product.seo.description) return product.seo.description;
  const lead = `${product.title} — ছেলেদের ঘড়ি।`;
  const colours = product.variants.length > 1 ? ` ${product.variants.map((v) => v.name).join(", ")} রঙে পাওয়া যাচ্ছে।` : "";
  const price = ` দাম ${bnMoney(lowestPrice(product), settings.currency)} থেকে`;
  const cod = settings.codEnabled ? `, ঘড়ি হাতে পেয়ে টাকা দিন।` : "।";
  // Drop the least important parts until it fits Google's ~160 character snippet.
  for (const text of [`${lead}${colours}${price}${cod}`, `${lead}${price}${cod}`, `${lead}${price}।`]) {
    if (text.length <= 160) return text;
  }
  return clip(lead, 160);
}

export function keywords(product: PublicProduct, settings: PublicSettings) {
  const bd = isBangladesh(settings);
  return [
    product.title,
    `${product.title} ঘড়ি`,
    bd && `${product.title} দাম`,
    product.specs.brand && `${product.specs.brand} ঘড়ি`,
    bd && product.specs.brand && `${product.specs.brand} ঘড়ির দাম`,
    "ছেলেদের ঘড়ি",
    "হাতঘড়ি",
    settings.brandName,
  ].filter(Boolean) as string[];
}

/** Best share image: admin-set OG image, else the first real product photo. */
export function shareImage(product: PublicProduct) {
  if (product.seo.ogImage) return product.seo.ogImage;
  return (product.images.find((i) => !i.placeholder) ?? product.images[0])?.url;
}

const ORG_ID = () => `${siteUrl()}/#organization`;

export function organizationJsonLd(settings: PublicSettings) {
  const base = siteUrl();
  const sameAs = Object.values(settings.social).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OnlineStore",
        "@id": ORG_ID(),
        name: settings.brandName,
        url: `${base}/`,
        logo: absoluteUrl(settings.logoUrl || "/icon.svg"),
        ...(settings.contact.email ? { email: settings.contact.email } : {}),
        ...(settings.contact.phone ? { telephone: settings.contact.phone } : {}),
        ...(settings.contact.address ? { address: settings.contact.address } : {}),
        ...(isBangladesh(settings) ? { areaServed: { "@type": "Country", name: "বাংলাদেশ" } } : {}),
        ...(settings.contact.phone || settings.contact.email
          ? {
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "গ্রাহক সেবা",
                ...(settings.contact.phone ? { telephone: settings.contact.phone } : {}),
                ...(settings.contact.email ? { email: settings.contact.email } : {}),
                availableLanguage: ["Bengali"],
              },
            }
          : {}),
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        name: settings.brandName,
        url: `${base}/`,
        inLanguage: "bn-BD",
        publisher: { "@id": ORG_ID() },
      },
    ],
  };
}

/**
 * Product structured data. Uses ProductGroup + hasVariant so each dial colour is
 * its own offer with its own price, stock and image (Google's variant format).
 */
export function productJsonLd(product: PublicProduct, settings: PublicSettings) {
  const base = siteUrl();
  const url = `${base}/`;
  const realImages = product.images.filter((i) => !i.placeholder).map((i) => absoluteUrl(i.url));
  const brand = product.specs.brand ? { "@type": "Brand", name: product.specs.brand } : undefined;
  const description = clip(product.description || product.tagline || seoDescription(product, settings), 5000);

  const specLabels: Partial<Record<keyof PublicProduct["specs"], string>> = {
    movement: "মেশিন",
    powerSource: "চলে যেভাবে",
    caseShape: "ডায়ালের আকার",
    dialSize: "ডায়ালের মাপ",
    caseThickness: "পুরুত্ব",
    caseMaterial: "বডির উপাদান",
    strapMaterial: "বেল্ট",
    bandLength: "বেল্টের দৈর্ঘ্য",
    bandWidth: "বেল্টের চওড়া",
    clasp: "লক",
    display: "ডিসপ্লে",
    calendar: "ক্যালেন্ডার",
    luminous: "অন্ধকারে জ্বলে",
    waterResistance: "পানি সহনীয়তা",
    glass: "কাচ",
    origin: "তৈরি",
    warranty: "ওয়ারেন্টি",
  };
  const additionalProperty = Object.entries(specLabels)
    .map(([k, name]) => {
      const value = product.specs[k as keyof typeof specLabels];
      return value ? { "@type": "PropertyValue", name, value } : null;
    })
    .filter(Boolean);

  const video =
    product.videoUrl && product.updatedAt
      ? {
          "@type": "VideoObject",
          name: `${product.title} — ভিডিও`,
          description: clip(seoDescription(product, settings), 300),
          contentUrl: absoluteUrl(product.videoUrl),
          thumbnailUrl: realImages.slice(0, 1),
          uploadDate: product.updatedAt,
        }
      : undefined;

  const variants = product.variants.map((v) => {
    const images = v.images.filter((i) => !i.placeholder).map((i) => absoluteUrl(i.url));
    return {
      "@type": "Product",
      "@id": `${url}#variant-${v.key}`,
      name: `${product.title} — ${v.name}`,
      sku: v.sku,
      color: v.name,
      ...(images.length ? { image: images } : realImages.length ? { image: realImages } : {}),
      offers: {
        "@type": "Offer",
        url,
        price: v.price,
        priceCurrency: settings.currency.code,
        availability: v.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": ORG_ID() },
        ...(settings.codEnabled ? { acceptedPaymentMethod: "https://schema.org/COD" } : {}),
      },
    };
  });

  const common = {
    name: product.title,
    description,
    url,
    ...(brand ? { brand } : {}),
    ...(product.specs.model ? { model: product.specs.model } : {}),
    ...(product.specs.caseMaterial ? { material: product.specs.caseMaterial } : {}),
    ...(realImages.length ? { image: realImages } : {}),
    ...(additionalProperty.length ? { additionalProperty } : {}),
    ...(video ? { subjectOf: video } : {}),
  };

  const data =
    variants.length > 1
      ? {
          "@context": "https://schema.org",
          "@type": "ProductGroup",
          "@id": `${url}#product`,
          productGroupID: product.sku,
          variesBy: ["https://schema.org/color"],
          ...common,
          hasVariant: variants,
        }
      : {
          "@context": "https://schema.org",
          "@type": "Product",
          "@id": `${url}#product`,
          sku: product.variants[0]?.sku ?? product.sku,
          ...common,
          ...(variants[0] ? { offers: variants[0].offers } : {}),
        };

  return data;
}

/** Serialise JSON-LD safely for inline <script> (prevents `</script>` breakouts). */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
