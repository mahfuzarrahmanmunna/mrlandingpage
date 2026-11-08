import type { OrderConfirmation, PublicProduct, PublicSettings, PublicVariant } from "@/lib/types";

type AnalyticsPayload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: AnalyticsPayload[];
    fbq?: (...args: unknown[]) => void;
    __fbqPending?: unknown[][];
  }
}

/** Meta Pixel call; parked until the pixel script loads (it flushes `__fbqPending`). */
function fbTrack(event: string, params: AnalyticsPayload = {}, eventId?: string) {
  if (typeof window === "undefined") return;
  const args: unknown[] = ["track", event, params, ...(eventId ? [{ eventID: eventId }] : [])];
  if (window.fbq) window.fbq(...args);
  else (window.__fbqPending ??= []).push(args);
}

type Item = { item_id?: unknown; quantity?: unknown };

function metaParams(ecommerce: AnalyticsPayload) {
  const items = (ecommerce.items as Item[] | undefined) ?? [];
  return {
    content_type: "product",
    content_ids: items.map((i) => String(i.item_id)),
    contents: items.map((i) => ({ id: String(i.item_id), quantity: Number(i.quantity ?? 1) })),
    num_items: items.reduce((n, i) => n + Number(i.quantity ?? 1), 0),
    value: ecommerce.value,
    currency: ecommerce.currency,
  };
}

/** GA4 ecommerce event name → Meta standard event. */
const META_ECOMMERCE: Record<string, string> = {
  view_item: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
};

const META_EVENTS: Record<string, string> = {
  generate_lead: "Lead",
  contact: "Contact",
};

function pushToDataLayer(payload: AnalyticsPayload) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
}

export function trackEvent(event: string, parameters: AnalyticsPayload = {}) {
  pushToDataLayer({ event, ...parameters });
  const meta = META_EVENTS[event];
  if (meta) fbTrack(meta, parameters);
}

export function trackEcommerceEvent(event: string, ecommerce: AnalyticsPayload) {
  pushToDataLayer({ ecommerce: null });
  pushToDataLayer({ event, ecommerce });
  const meta = META_ECOMMERCE[event];
  // Order number doubles as the Purchase event ID, so a future server-side (CAPI) event dedupes.
  if (meta) fbTrack(meta, metaParams(ecommerce), event === "purchase" ? String(ecommerce.transaction_id) : undefined);
}

export function analyticsItem(product: PublicProduct, variant: PublicVariant, quantity = 1) {
  return {
    item_id: variant.sku || product.sku,
    item_name: product.title,
    item_variant: variant.name,
    price: variant.price,
    quantity,
  };
}

export function trackPurchase(order: OrderConfirmation) {
  if (typeof window === "undefined") return;

  const storageKey = `mri:gtm:purchase:${order.orderNumber}`;
  try {
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, "1");
  } catch {}

  trackEcommerceEvent("purchase", {
    transaction_id: order.orderNumber,
    value: Math.max(0, order.subtotal - order.discount),
    currency: order.currency.code,
    shipping: order.deliveryFee,
    payment_type: order.paymentMethod,
    items: order.items.map((item) => ({
      item_id: item.sku,
      item_name: item.title,
      item_variant: item.variantName,
      price: item.unitPrice,
      quantity: item.quantity,
    })),
  });
}

export function checkoutAnalytics(product: PublicProduct, settings: PublicSettings, variant: PublicVariant, quantity: number) {
  return {
    currency: settings.currency.code,
    value: variant.price * quantity,
    items: [analyticsItem(product, variant, quantity)],
  };
}