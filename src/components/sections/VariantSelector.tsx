"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { QuantityStepper } from "@/components/storefront/PurchaseControls";
import { useStorefront } from "@/components/storefront/StorefrontProvider";
import { formatMoney } from "@/lib/format";

/** Section 5 — each edition with its own image, price, SKU and live availability. */
export function VariantSelector() {
  const { product, variant, setVariantKey, settings, maxQuantity, quantity, subtotal } = useStorefront();
  const money = (n: number) => formatMoney(n, settings.currency);

  return (
    <section id="editions" aria-labelledby="editions-title" className="bg-linen">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-8 lg:px-10 lg:py-20">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow" data-reveal>
              রঙ বাছাই
            </p>
            <h2 id="editions-title" className="display num mt-4 text-[clamp(1.75rem,4.5vw,2.75rem)] text-ink" data-reveal>
              {product.variants.length > 1 ? (
                <>
                  আপনার পছন্দের <span className="text-champagne-ink">রঙটি বেছে নিন</span>
                </>
              ) : (
                <>আপনার ঘড়ি</>
              )}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <span className="text-[0.95rem] font-semibold text-graphite">পরিমাণ</span>
            <QuantityStepper id="editions-qty" />
            <span className="num text-2xl font-extrabold text-champagne-ink" aria-live="polite">
              {money(subtotal)}
              <span className="sr-only"> ({quantity}টি)</span>
            </span>
          </div>
        </div>

        <fieldset className="mt-6">
          <legend className="sr-only">রঙ বাছাই করুন</legend>
          <div className="grid grid-cols-1 gap-2.5 min-[480px]:grid-cols-2 lg:grid-cols-3">
            {product.variants.map((v) => {
              const selected = v.key === variant.key;
              const img = v.images[0] ?? product.images[0];
              return (
                <label
                  key={v.key}
                  className={`relative flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] border-2 bg-white p-2 pr-3 transition ${
                    selected ? "border-champagne bg-champagne-soft/40 shadow-soft" : "border-rule hover:border-champagne/50"
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
                  <div className="paper relative size-16 shrink-0 overflow-hidden rounded-[8px]">
                    {img ? (
                      <Image
                        src={img.url}
                        alt=""
                        fill
                        sizes="64px"
                        loading="lazy"
                        unoptimized={img.url.endsWith(".svg")}
                        className={`object-cover ${v.available ? "" : "grayscale"}`}
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-base font-bold text-ink">
                      {v.swatch ? (
                        <span aria-hidden className="size-3 shrink-0 rounded-full ring-1 ring-rule" style={{ background: v.swatch }} />
                      ) : null}
                      {v.name}
                    </p>
                    <p className="num mt-0.5 flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-champagne-ink">{money(v.price)}</span>
                      {v.compareAtPrice ? <span className="text-xs text-mist line-through">{money(v.compareAtPrice)}</span> : null}
                    </p>
                    <p className={`num text-xs ${v.available ? "text-success" : "text-danger"}`}>
                      {v.available ? (v.stock <= 3 ? `মাত্র ${v.stock}টি বাকি` : "স্টকে আছে") : "স্টক শেষ"}
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className={`grid size-6 shrink-0 place-items-center rounded-full border-2 transition ${
                      selected ? "border-champagne bg-champagne text-white" : "border-rule text-transparent"
                    }`}
                  >
                    <Icon name="check" size={13} strokeWidth={2.5} />
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
        {maxQuantity > 0 && maxQuantity < settings.maxQuantityPerOrder ? (
          <p className="num mt-5 text-sm text-mist">এই রঙের সর্বোচ্চ {maxQuantity}টি অর্ডার করা যাবে।</p>
        ) : null}
      </div>
    </section>
  );
}
