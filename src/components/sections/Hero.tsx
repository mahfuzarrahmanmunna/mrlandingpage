"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { goToOrder } from "@/components/motion/scroll";
import { Gallery } from "@/components/storefront/Gallery";
import {
  ContactActions,
  PriceDisplay,
  QuantityStepper,
  StockStatus,
  VariantSwatches,
} from "@/components/storefront/PurchaseControls";
import { useStorefront } from "@/components/storefront/StorefrontProvider";
import { formatMoney } from "@/lib/format";
import { langOf } from "@/lib/lang";

export function Hero() {
  const { product, settings, variant, quantity, subtotal } = useStorefront();
  const title = settings.hero.headline || product.title;
  const words = title.split(" ");
  const last = words.length > 1 ? words.pop() : undefined;
  const soldOut = variant.stock < 1;
  const trust = settings.trustHighlights.slice(0, 3);

  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-[15%] -top-[25%] h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(closest-side,rgba(217,195,155,0.28),transparent)]" />
      </div>

      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-6 px-4 pb-12 pt-4 sm:gap-8 sm:px-6 sm:pt-6 md:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12 lg:px-10 lg:pb-20 lg:pt-10 xl:gap-16">
        {/* Gallery — first on mobile, stays in view on desktop while details scroll. */}
        <div className="min-w-0">
          <div className="mx-auto w-full max-w-[560px] lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:max-w-none">
            <Gallery />
          </div>
        </div>

        {/* Details & purchase */}
        <div className="mx-auto flex w-full min-w-0 max-w-[560px] flex-col lg:mx-0 lg:max-w-none lg:py-2">
          {settings.hero.eyebrow ? (
            <p className="label flex items-center gap-3 text-champagne-ink">
              <span aria-hidden className="h-px w-6 bg-champagne" />
              {settings.hero.eyebrow}
            </p>
          ) : null}

          <h1
            id="hero-title"
            className="display mt-3 text-balance text-[clamp(2.25rem,7vw,3.75rem)] leading-[1.02] text-ink"
          >
            {words.join(" ")}
            {last ? <span className="italic text-graphite"> {last}</span> : null}
          </h1>

          {product.tagline ? (
            <p lang={langOf(product.tagline)} className="mt-3 max-w-xl text-pretty text-lg leading-snug text-graphite sm:text-xl">
              {product.tagline}
            </p>
          ) : null}
          {settings.hero.subheadline ? (
            <p lang={langOf(settings.hero.subheadline)} className="mt-2 max-w-xl text-pretty text-[0.95rem] leading-relaxed text-mist">
              {settings.hero.subheadline}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-rule py-4">
            <PriceDisplay />
            <StockStatus />
          </div>

          <div className="mt-6">
            <VariantSwatches />
          </div>

          <div id="hero-cta" className="mt-6 grid gap-3">
            <div className="flex flex-wrap items-stretch gap-3">
              <QuantityStepper id="hero-qty" />
              <Button
                size="lg"
                onClick={goToOrder}
                disabled={soldOut}
                className="min-w-[9rem] flex-1 px-5"
                icon={
                  soldOut ? undefined : (
                    <Icon name="arrow-right" size={16} className="order-last transition-transform group-hover:translate-x-1" />
                  )
                }
              >
                {soldOut ? "Sold out" : "Order now"}
              </Button>
            </div>
            {quantity > 1 && !soldOut ? (
              <p className="num text-sm text-graphite">
                Subtotal for {quantity}:{" "}
                <span className="font-semibold text-ink">{formatMoney(subtotal, settings.currency)}</span>
              </p>
            ) : null}
            <ContactActions />
            {settings.codEnabled && !trust.some((t) => t.icon === "cash") ? (
              <p className="flex items-center gap-2 text-sm text-graphite">
                <Icon name="cash" size={18} className="text-champagne-ink" />
                Cash on delivery — pay when the watch arrives.
              </p>
            ) : null}
          </div>

          {product.highlights.length ? (
            <ul className="mt-7 grid grid-cols-1 gap-2.5 rounded-[var(--radius-md)] bg-porcelain/80 p-4 ring-1 ring-rule-soft min-[420px]:grid-cols-2 sm:p-5">
              {product.highlights.map((h) => (
                <li key={h} lang={langOf(h)} className="flex items-start gap-2.5 text-sm text-ink">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-champagne/15 text-champagne-ink">
                    <Icon name="check" size={13} strokeWidth={2} />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          ) : null}

          {trust.length ? (
            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {trust.map((t) => (
                <li key={t.title} className="flex items-center gap-2.5 text-[0.8rem] leading-snug text-graphite sm:flex-col sm:items-start sm:gap-1.5">
                  <Icon name={t.icon} size={20} className="shrink-0 text-champagne-ink" />
                  {t.title}
                </li>
              ))}
            </ul>
          ) : null}

          <a
            href="#details"
            className="mt-7 inline-flex items-center gap-2 self-start text-sm font-semibold text-ink underline-offset-4 hover:underline"
          >
            See all features
            <Icon name="arrow-right" size={14} className="rotate-90" />
          </a>
        </div>
      </div>
    </section>
  );
}
