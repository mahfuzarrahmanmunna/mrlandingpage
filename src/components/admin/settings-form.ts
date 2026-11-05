/** Shared (server + client) shape for the settings editor form. */
export const ICONS = ["truck", "shield", "seal", "headset", "box", "return", "cash", "clock", "spark"] as const;
export type Icon = (typeof ICONS)[number];
export type HighlightRow = { icon: Icon; title: string; text: string };
export type ZoneRow = { id: string; label: string; fee: number | string; description: string; active: boolean };
export type TestimonialRow = { name: string; location: string; text: string; approved: boolean };

export type SettingsForm = {
  brandName: string;
  logoUrl: string;
  announcement: string;
  hero: { eyebrow: string; headline: string; subheadline: string };
  currency: { code: string; symbol: string };
  contact: { phone: string; whatsapp: string; email: string; address: string; hours: string };
  social: { facebook: string; instagram: string; tiktok: string; youtube: string };
  trustHighlights: HighlightRow[];
  whyChoose: HighlightRow[];
  testimonials: TestimonialRow[];
  policies: { shipping: string; returns: string; warranty: string; privacy: string };
  shippingZones: ZoneRow[];
  codEnabled: boolean;
  onlinePaymentEnabled: false;
  show3DPreview: boolean;
  whatsappMessage: string;
  maxQuantityPerOrder: number | string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export function toSettingsForm(s: any | null): SettingsForm {
  const hl = (list: any[] | undefined): HighlightRow[] =>
    (list ?? []).map((h) => ({ icon: ICONS.includes(h.icon) ? h.icon : "spark", title: h.title ?? "", text: h.text ?? "" }));
  return {
    brandName: s?.brandName ?? "MR Imperial",
    logoUrl: s?.logoUrl ?? "",
    announcement: s?.announcement ?? "",
    hero: { eyebrow: s?.hero?.eyebrow ?? "", headline: s?.hero?.headline ?? "", subheadline: s?.hero?.subheadline ?? "" },
    currency: { code: s?.currency?.code ?? "BDT", symbol: s?.currency?.symbol ?? "৳" },
    contact: {
      phone: s?.contact?.phone ?? "",
      whatsapp: s?.contact?.whatsapp ?? "",
      email: s?.contact?.email ?? "",
      address: s?.contact?.address ?? "",
      hours: s?.contact?.hours ?? "",
    },
    social: {
      facebook: s?.social?.facebook ?? "",
      instagram: s?.social?.instagram ?? "",
      tiktok: s?.social?.tiktok ?? "",
      youtube: s?.social?.youtube ?? "",
    },
    trustHighlights: hl(s?.trustHighlights),
    whyChoose: hl(s?.whyChoose),
    testimonials: (s?.testimonials ?? []).map((t: any) => ({
      name: t.name ?? "",
      location: t.location ?? "",
      text: t.text ?? "",
      approved: Boolean(t.approved),
    })),
    policies: {
      shipping: s?.policies?.shipping ?? "",
      returns: s?.policies?.returns ?? "",
      warranty: s?.policies?.warranty ?? "",
      privacy: s?.policies?.privacy ?? "",
    },
    shippingZones: (s?.shippingZones ?? []).map((z: any) => ({
      id: z.id ?? "",
      label: z.label ?? "",
      fee: z.fee ?? 0,
      description: z.description ?? "",
      active: z.active !== false,
    })),
    codEnabled: s ? s.codEnabled !== false : true,
    onlinePaymentEnabled: false,
    show3DPreview: s ? s.show3DPreview !== false : true,
    whatsappMessage: s?.whatsappMessage ?? "Hello MR Imperial, I'd like to order {product} ({variant}) × {quantity}.",
    maxQuantityPerOrder: s?.maxQuantityPerOrder ?? 5,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
