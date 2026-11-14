"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { goToOrder } from "@/components/motion/scroll";
import { Icon } from "@/components/ui/Icon";
import { QuantityStepper } from "@/components/storefront/PurchaseControls";
import { useStorefront } from "@/components/storefront/StorefrontProvider";
import { formatMoney } from "@/lib/format";

/** Section 5 — each edition with its own image, price, SKU and live availability. */
export function VariantSelector() {
  const { product, variant, setVariantKey, settings, maxQuantity, quantity, subtotal } = useStorefront();
  const money = (n: number) => formatMoney(n, settings.currency);

  const cols = product.variants.length >= 5 ? "lg:grid-cols-5" : product.variants.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return (
    <section id="editions" aria-labelledby="editions-title" className="bg-ivory">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow" data-reveal>
              রঙ বাছাই
            </p>
            <h2 id="editions-title" className="h-section num mt-4 text-ink" data-reveal>
              {product.variants.length > 1 ? (
                <>
                  আপনার পছন্দের <span className="accent">রঙটি বেছে নিন</span>
                </>
              ) : (
                <>আপনার ঘড়ি</>
              )}
            </h2>
          </div>
          <div className="panel flex flex-wrap items-center gap-x-5 gap-y-3 self-start px-4 py-3 lg:self-auto">
            <span className="text-[0.95rem] text-graphite">পরিমাণ</span>
            <QuantityStepper id="editions-qty" />
            <span className="num text-2xl font-extrabold text-ink" aria-live="polite">
              {money(subtotal)}
              <span className="sr-only"> ({quantity}টি)</span>
            </span>
          </div>
        </div>

        <fieldset className="mt-8">
          <legend className="sr-only">রঙ বাছাই করুন</legend>
          <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 ${cols}`}>
            {product.variants.map((v) => {
              const selected = v.key === variant.key;
              const img = v.images[0] ?? product.images[0];
              return (
                <label
                  key={v.key}
                  className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-[var(--radius-md)] border bg-white transition duration-300 ${
                    selected ? "border-ink shadow-lift ring-1 ring-ink" : "border-rule hover:-translate-y-0.5 hover:border-steel hover:shadow-soft"
                  } ${v.available ? "" : "cursor-not-allowed opacity-60"} has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink`}
                >
                  <input
                    type="radio"
                    name="variant"
                    value={v.key}
                    checked={selected}
                    disabled={!v.available}
                    onChange={() => setVariantKey(v.key)}
                    className="sr-only"
                  />
                  <div className="paper relative aspect-square w-full overflow-hidden">
                    {img ? (
                      <Image
                        src={img.url}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw"
                        loading="lazy"
                        unoptimized={img.url.endsWith(".svg")}
                        className={`object-cover transition-transform duration-500 group-hover:scale-[1.04] ${v.available ? "" : "grayscale"}`}
                      />
                    ) : null}
                    <span
                      aria-hidden
                      className={`absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-full border-2 transition ${
                        selected ? "border-ink bg-ink text-white" : "border-white/90 bg-white/70 text-transparent backdrop-blur"
                      }`}
                    >
                      <Icon name="check" size={14} strokeWidth={2.5} />
                    </span>
                    {!v.available ? (
                      <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-1.5 text-center text-xs font-semibold text-white">স্টক শেষ</span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
                    <p className="flex items-center gap-2 text-[0.95rem] font-bold text-ink">
                      {v.swatch ? (
                        <span aria-hidden className="size-3.5 shrink-0 rounded-full ring-1 ring-black/15" style={{ background: v.swatch }} />
                      ) : null}
                      <span className="truncate">{v.name}</span>
                    </p>
                    <p className="num flex flex-wrap items-baseline gap-x-2">
                      <span className="text-base font-extrabold text-ink">{money(v.price)}</span>
                      {v.compareAtPrice ? <span className="text-xs text-mist line-through">{money(v.compareAtPrice)}</span> : null}
                    </p>
                    {v.available ? (
                      <p className={`num text-xs ${v.stock <= 3 ? "font-semibold text-offer" : "text-success"}`}>
                        {v.stock <= 3 ? `মাত্র ${v.stock}টি বাকি` : "স্টকে আছে"}
                      </p>
                    ) : null}
                  </div>
                </label>
              );
            })}
          </div>
        </fieldset>
        {maxQuantity > 0 && maxQuantity < settings.maxQuantityPerOrder ? (
          <p className="num mt-5 text-sm text-mist">এই রঙের সর্বোচ্চ {maxQuantity}টি অর্ডার করা যাবে।</p>
        ) : null}
        <div className="mt-8 flex justify-center">
          <Button size="lg" onClick={goToOrder} disabled={variant.stock < 1} className="w-full sm:w-auto sm:min-w-80">
            {variant.stock < 1 ? "স্টক শেষ" : `${variant.name} — অর্ডার করুন`}
          </Button>
        </div>
      </div>
    </section>
  );
}
