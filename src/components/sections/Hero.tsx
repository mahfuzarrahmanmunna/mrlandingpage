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
  // COD already has its own line in the delivery box below — don't repeat it.
  const trust = settings.trustHighlights.filter((t) => !(settings.codEnabled && t.icon === "cash")).slice(0, 3);
  const zones = settings.shippingZones;
  const money = (n: number) => formatMoney(n, settings.currency);

  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-6 px-4 pb-12 pt-4 sm:gap-8 sm:px-6 sm:pt-6 md:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12 lg:px-10 lg:pb-20 lg:pt-10">
        {/* Gallery — first on mobile, stays in view on desktop while details scroll. */}
        <div className="min-w-0">
          <div className="mx-auto w-full max-w-[560px] lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:max-w-none">
            <Gallery />
          </div>
        </div>

        {/* Details & purchase */}
        <div className="mx-auto flex w-full min-w-0 max-w-[560px] flex-col lg:mx-0 lg:max-w-none lg:py-2">
          {settings.hero.eyebrow ? (
            <p lang={langOf(settings.hero.eyebrow)} className="eyebrow self-start">
              <Icon name="spark" size={14} />
              {settings.hero.eyebrow}
            </p>
          ) : null}

          <h1 id="hero-title" lang={langOf(title)} className="display mt-3 text-balance text-[clamp(1.9rem,6vw,3rem)] text-ink">
            {title}
          </h1>

          {product.tagline ? (
            <p lang={langOf(product.tagline)} className="mt-3 max-w-xl text-pretty text-lg leading-relaxed text-graphite">
              {product.tagline}
            </p>
          ) : null}
          {settings.hero.subheadline ? (
            <p lang={langOf(settings.hero.subheadline)} className="mt-2 max-w-xl text-pretty leading-relaxed text-mist">
              {settings.hero.subheadline}
            </p>
          ) : null}

          {/* Price card */}
          <div className="mt-5 rounded-[var(--radius-md)] border border-rule bg-white p-4 shadow-soft sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <PriceDisplay />
              <StockStatus />
            </div>
          </div>

          <div className="mt-5">
            <VariantSwatches />
          </div>

          <div id="hero-cta" className="mt-5 grid gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[0.95rem] font-semibold text-graphite">পরিমাণ:</span>
              <QuantityStepper id="hero-qty" />
              {quantity > 1 && !soldOut ? (
                <span className="num text-[0.95rem] text-graphite">
                  মোট: <span className="font-bold text-ink">{money(subtotal)}</span>
                </span>
              ) : null}
            </div>
            <Button
              size="lg"
              onClick={goToOrder}
              disabled={soldOut}
              className="w-full text-xl"
              icon={soldOut ? undefined : <Icon name="cash" size={22} />}
            >
              {soldOut ? "স্টক শেষ" : "অর্ডার করুন"}
            </Button>
            <ContactActions />
          </div>

          {/* Delivery & payment at a glance */}
          {zones.length || settings.codEnabled ? (
            <div className="mt-5 grid gap-2.5 rounded-[var(--radius-md)] bg-linen p-4 sm:p-5">
              {settings.codEnabled ? (
                <p className="flex items-center gap-3 text-[0.95rem] font-semibold text-ink">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-champagne-ink">
                    <Icon name="cash" size={18} />
                  </span>
                  ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে টাকা দিন
                </p>
              ) : null}
              {zones.length ? (
                <div className="flex items-start gap-3 text-[0.95rem] text-graphite">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-champagne-ink">
                    <Icon name="truck" size={18} />
                  </span>
                  <ul className="grid gap-0.5 pt-1.5">
                    {zones.map((z) => (
                      <li key={z.id} className="num">
                        ডেলিভারি চার্জ <span lang={langOf(z.label)}>({z.label})</span>:{" "}
                        <span className="font-bold text-ink">{z.fee === 0 ? "ফ্রি" : money(z.fee)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {product.highlights.length ? (
            <ul className="mt-5 grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
              {product.highlights.map((h) => (
                <li key={h} lang={langOf(h)} className="flex items-start gap-2.5 text-[0.95rem] text-ink">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-champagne text-white">
                    <Icon name="check" size={12} strokeWidth={2.5} />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          ) : null}

          {trust.length ? (
            <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {trust.map((t) => (
                <li
                  key={t.title}
                  lang={langOf(t.title)}
                  className="flex items-center gap-2.5 rounded-[var(--radius-sm)] border border-rule bg-white px-3 py-2.5 text-sm font-medium leading-snug text-graphite sm:flex-col sm:items-start sm:gap-1.5"
                >
                  <Icon name={t.icon} size={20} className="shrink-0 text-champagne-ink" />
                  {t.title}
                </li>
              ))}
            </ul>
          ) : null}

          <a
            href="#details"
            className="mt-6 inline-flex items-center gap-2 self-start text-[0.95rem] font-semibold text-champagne-ink underline-offset-4 hover:underline"
          >
            সব বৈশিষ্ট্য দেখুন
            <Icon name="arrow-right" size={14} className="rotate-90" />
          </a>
        </div>
      </div>
    </section>
  );
}
