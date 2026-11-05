"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { goToOrder } from "@/components/motion/scroll";
import { Gallery } from "@/components/storefront/Gallery";
import { ContactActions, PriceDisplay, StockStatus, VariantSwatches } from "@/components/storefront/PurchaseControls";
import { useStorefront } from "@/components/storefront/StorefrontProvider";

function DialRing() {
  const ticks = Array.from({ length: 60 }, (_, i) => i);
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 400"
      className="pointer-events-none absolute left-1/2 top-1/2 -z-10 w-[132%] max-w-none -translate-x-1/2 -translate-y-1/2 text-rule"
    >
      <g data-parallax-rotate="24" style={{ transformOrigin: "200px 200px", transformBox: "view-box" }}>
        <circle cx="200" cy="200" r="196" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="178" fill="none" stroke="currentColor" strokeWidth="0.35" strokeDasharray="1 3" />
        {ticks.map((i) => (
          <line
            key={i}
            x1="200"
            y1={i % 5 === 0 ? 6 : 10}
            x2="200"
            y2="16"
            stroke={i % 15 === 0 ? "var(--champagne)" : "currentColor"}
            strokeWidth={i % 5 === 0 ? 0.9 : 0.4}
            transform={`rotate(${i * 6} 200 200)`}
          />
        ))}
      </g>
    </svg>
  );
}

export function Hero() {
  const { product, settings, variant } = useStorefront();
  const words = (settings.hero.headline || product.title).split(" ");
  const last = words.pop();
  const soldOut = variant.stock < 1;

  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute -right-[20%] -top-[30%] h-[80vmax] w-[80vmax] rounded-full bg-[radial-gradient(closest-side,rgba(217,195,155,0.32),transparent)]" />
        <div className="absolute -left-[25%] bottom-[-40%] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(closest-side,rgba(167,163,155,0.16),transparent)]" />
      </div>

      <div className="mx-auto grid w-full max-w-[1360px] gap-8 px-5 pb-16 pt-4 sm:px-8 sm:pt-8 lg:grid-cols-12 lg:gap-12 lg:px-12 lg:pb-28 lg:pt-12">
        <div className="relative lg:order-2 lg:col-span-7">
          <div className="relative mx-auto max-w-[640px]">
            <div className="absolute inset-0 hidden lg:block">
              <DialRing />
            </div>
            <Gallery />
          </div>
        </div>

        <div className="flex flex-col lg:order-1 lg:col-span-5 lg:pt-10">
          {settings.hero.eyebrow ? (
            <p className="label flex items-center gap-3 text-champagne-ink">
              <span aria-hidden className="h-px w-8 bg-champagne" />
              {settings.hero.eyebrow}
            </p>
          ) : null}

          <h1 id="hero-title" className="display mt-4 text-[clamp(3rem,11vw,6.75rem)] text-ink lg:mt-6">
            {words.length ? <span className="block">{words.join(" ")}</span> : null}
            <span className="block italic text-graphite">{last}</span>
          </h1>

          {product.tagline ? (
            <p className="mt-5 max-w-md font-serif text-xl leading-snug text-graphite sm:text-2xl">{product.tagline}</p>
          ) : null}
          {settings.hero.subheadline ? (
            <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-mist">{settings.hero.subheadline}</p>
          ) : null}

          <div className="mt-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-t border-rule pt-6">
            <PriceDisplay />
            <StockStatus />
          </div>

          <div className="mt-6">
            <VariantSwatches />
          </div>

          <div id="hero-cta" className="mt-7 grid gap-2.5">
            <Button
              size="lg"
              onClick={goToOrder}
              disabled={soldOut}
              icon={soldOut ? undefined : <Icon name="arrow-right" size={16} className="order-last transition-transform group-hover:translate-x-1" />}
            >
              {soldOut ? "This edition is unavailable" : "Order now"}
            </Button>
            <ContactActions />
          </div>

          {product.highlights.length ? (
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[0.8rem] text-graphite">
              {product.highlights.map((h) => (
                <li key={h} className="flex items-center gap-2">
                  <span aria-hidden className="size-1 rounded-full bg-champagne" />
                  {h}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
