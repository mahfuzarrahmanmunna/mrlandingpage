import type { OrderConfirmation, PublicProduct, PublicSettings, PublicVariant } from "@/lib/types";

type AnalyticsPayload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: AnalyticsPayload[];
  }
}

function pushToDataLayer(payload: AnalyticsPayload) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
}

export function trackEvent(event: string, parameters: AnalyticsPayload = {}) {
  pushToDataLayer({ event, ...parameters });
}

export function trackEcommerceEvent(event: string, ecommerce: AnalyticsPayload) {
  pushToDataLayer({ ecommerce: null });
  pushToDataLayer({ event, ecommerce });
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