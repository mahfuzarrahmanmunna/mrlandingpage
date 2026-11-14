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
  const soldOut = variant.stock < 1;
  const zones = settings.shippingZones;
  const money = (n: number) => formatMoney(n, settings.currency);

  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate">
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-6 px-4 pb-14 pt-4 sm:gap-8 sm:px-6 sm:pt-6 md:px-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-14 lg:px-10 lg:pb-24 lg:pt-10">
        {/* Gallery — first on mobile, stays in view on desktop while details scroll. */}
        <div className="min-w-0">
          <div className="mx-auto w-full max-w-[580px] lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:max-w-none">
            <Gallery />
          </div>
        </div>

        {/* Details & purchase */}
        <div className="mx-auto flex w-full min-w-0 max-w-[580px] flex-col lg:mx-0 lg:max-w-none lg:py-2">
          {settings.hero.eyebrow ? (
            <p lang={langOf(settings.hero.eyebrow)} className="eyebrow self-start">
              {settings.hero.eyebrow}
            </p>
          ) : null}

          <h1 id="hero-title" lang={langOf(title)} className="display mt-3 text-balance text-[clamp(1.9rem,5.5vw,2.9rem)] text-ink">
            {title}
          </h1>

          {product.tagline ? (
            <p lang={langOf(product.tagline)} className="mt-3 max-w-xl text-pretty text-[1.075rem] leading-relaxed text-graphite">
              {product.tagline}
            </p>
          ) : null}
          {settings.hero.subheadline ? (
            <p lang={langOf(settings.hero.subheadline)} className="mt-2 max-w-xl text-pretty leading-relaxed text-mist">
              {settings.hero.subheadline}
            </p>
          ) : null}

          {/* Purchase panel — price, colour, quantity and every way to buy, in one place. */}
          <div className="panel mt-6 overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <PriceDisplay />
                <StockStatus />
              </div>

              <div className="hairline my-5" />

              <VariantSwatches />

              <div id="hero-cta" className="mt-5 grid gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[0.95rem] text-graphite">পরিমাণ</span>
                    <QuantityStepper id="hero-qty" />
                  </div>
                  {quantity > 1 && !soldOut ? (
                    <span className="num text-[0.95rem] text-graphite">
                      মোট: <span className="text-lg font-bold text-ink">{money(subtotal)}</span>
                    </span>
                  ) : null}
                </div>
                <Button
                  size="lg"
                  onClick={goToOrder}
                  disabled={soldOut}
                  className="mt-1 w-full text-xl"
                  icon={soldOut ? undefined : <Icon name="cash" size={22} />}
                >
                  {soldOut ? "স্টক শেষ" : "এখনই অর্ডার করুন"}
                </Button>
                <ContactActions />
              </div>
            </div>

            {/* Delivery & payment at a glance */}
            {zones.length || settings.codEnabled ? (
              <div className="grid gap-3 border-t border-rule-soft bg-linen/70 px-4 py-4 sm:px-6">
                {settings.codEnabled ? (
                  <p className="flex items-center gap-3 text-[0.95rem] font-semibold text-ink">
                    <Icon name="cash" size={20} className="shrink-0 text-champagne-ink" />
                    ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে টাকা দিন
                  </p>
                ) : null}
                {zones.length ? (
                  <div className="flex items-start gap-3 text-[0.95rem] text-graphite">
                    <Icon name="truck" size={20} className="mt-0.5 shrink-0 text-champagne-ink" />
                    <ul className="grid gap-0.5">
                      {zones.map((z) => (
                        <li key={z.id} className="num">
                          ডেলিভারি <span lang={langOf(z.label)}>({z.label})</span>:{" "}
                          <span className="font-bold text-ink">{z.fee === 0 ? "ফ্রি" : money(z.fee)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {product.highlights.length ? (
            <ul className="mt-6 grid grid-cols-1 gap-x-4 gap-y-2.5 min-[420px]:grid-cols-2">
              {product.highlights.map((h) => (
                <li key={h} lang={langOf(h)} className="flex items-start gap-2.5 text-[0.95rem] text-graphite">
                  <Icon name="check" size={16} strokeWidth={2.5} className="mt-1 shrink-0 text-champagne-ink" />
                  {h}
                </li>
              ))}
            </ul>
          ) : null}

          <a
            href="#details"
            className="mt-6 inline-flex items-center gap-2 self-start text-[0.95rem] font-semibold text-ink underline decoration-champagne decoration-1 underline-offset-[6px] transition hover:decoration-2"
          >
            সব বৈশিষ্ট্য দেখুন
            <Icon name="arrow-right" size={14} className="rotate-90" />
          </a>
        </div>
      </div>
    </section>
  );
}
