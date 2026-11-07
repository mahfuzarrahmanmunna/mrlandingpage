"use client";

import { Button } from "@/components/ui/Button";
import { goToOrder } from "@/components/motion/scroll";
import { ContactActions, QuantityStepper } from "@/components/storefront/PurchaseControls";
import { useStorefront } from "@/components/storefront/StorefrontProvider";
import { formatMoney } from "@/lib/format";

/** Section 2 — the current selection at a glance, with every way to buy. */
export function PurchaseActions() {
  const { product, variant, quantity, subtotal, settings } = useStorefront();
  const soldOut = variant.stock < 1;
  return (
    <section aria-label="Your selection" className="border-y border-rule bg-porcelain">
      <div className="mx-auto grid w-full max-w-[1360px] grid-cols-1 items-center gap-6 px-5 py-7 sm:px-8 lg:grid-cols-12 lg:px-12">
        <div className="flex min-w-0 items-center gap-5 lg:col-span-4">
          <p className="label hidden text-mist sm:block">Your selection</p>
          <div className="min-w-0">
            <p className="truncate font-serif text-2xl text-ink">
              {product.title} <span className="text-graphite italic">— {variant.name}</span>
            </p>
            <p className="num text-xs text-mist">SKU {variant.sku}</p>
          </div>
        </div>
        <div className="flex min-w-0 items-center justify-between gap-5 lg:col-span-3 lg:justify-center">
          <QuantityStepper id="selection-qty" />
          <p className="num text-right lg:text-left">
            <span className="label block text-mist">Subtotal</span>
            <span className="font-serif text-2xl text-ink">{formatMoney(subtotal, settings.currency)}</span>
            <span className="sr-only"> for {quantity}</span>
          </p>
        </div>
        <div className="grid min-w-0 gap-2.5 sm:grid-cols-[1.2fr_1fr] lg:col-span-5">
          <Button onClick={goToOrder} disabled={soldOut}>
            {soldOut ? "Unavailable" : "Order now"}
          </Button>
          <ContactActions compact />
        </div>
      </div>
    </section>
  );
}
