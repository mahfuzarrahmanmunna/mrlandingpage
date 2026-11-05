/** Shared (server + client) shape for the product editor form. */
export type Img = { url: string; alt: string; placeholder: boolean };
export type Variant = {
  key: string;
  name: string;
  sku: string;
  price: number | string;
  compareAtPrice: number | string;
  stock: number | string;
  swatch: string;
  images: Img[];
  active: boolean;
  lowStockThreshold: number | string;
};
export const SPEC_FIELDS = [
  ["brand", "Brand"],
  ["model", "Model"],
  ["sku", "Reference / SKU"],
  ["dialSize", "Case diameter (e.g. 40 mm)"],
  ["caseThickness", "Case thickness"],
  ["caseMaterial", "Case material"],
  ["strapMaterial", "Strap / bracelet"],
  ["movement", "Movement"],
  ["waterResistance", "Water resistance"],
  ["glass", "Crystal / glass"],
  ["dialColor", "Dial colour"],
  ["color", "Colour"],
  ["warranty", "Warranty (only if confirmed)"],
] as const;

export type ProductForm = {
  title: string;
  slug: string;
  tagline: string;
  description: string;
  price: number | string;
  compareAtPrice: number | string;
  sku: string;
  images: Img[];
  modelUrl: string;
  specs: Record<string, string>;
  variantLabel: string;
  variants: Variant[];
  highlights: string[];
  status: "active" | "draft" | "archived";
  isDemo: boolean;
  seo: { title: string; description: string; ogImage: string };
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export function toProductForm(p: any | null): ProductForm {
  const imgs = (list: any[] | undefined): Img[] =>
    (list ?? []).map((i) => ({ url: i.url ?? "", alt: i.alt ?? "", placeholder: Boolean(i.placeholder) }));
  return {
    title: p?.title ?? "",
    slug: p?.slug ?? "",
    tagline: p?.tagline ?? "",
    description: p?.description ?? "",
    price: p?.price ?? "",
    compareAtPrice: p?.compareAtPrice ?? "",
    sku: p?.sku ?? "",
    images: imgs(p?.images),
    modelUrl: p?.modelUrl ?? "",
    specs: Object.fromEntries(SPEC_FIELDS.map(([k]) => [k, p?.specs?.[k] ?? ""])),
    variantLabel: p?.variantLabel ?? "Edition",
    variants: (p?.variants ?? []).map((v: any) => ({
      key: v.key ?? "",
      name: v.name ?? "",
      sku: v.sku ?? "",
      price: v.price ?? "",
      compareAtPrice: v.compareAtPrice ?? "",
      stock: v.stock ?? 0,
      swatch: v.swatch ?? "",
      images: imgs(v.images),
      active: v.active !== false,
      lowStockThreshold: v.lowStockThreshold ?? 3,
    })),
    highlights: p?.highlights ?? [],
    status: p?.status ?? "draft",
    isDemo: Boolean(p?.isDemo),
    seo: { title: p?.seo?.title ?? "", description: p?.seo?.description ?? "", ogImage: p?.seo?.ogImage ?? "" },
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

