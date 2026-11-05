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
    <section id="editions" aria-labelledby="editions-title" className="border-t border-rule bg-linen/45">
      <div className="mx-auto w-full max-w-[1360px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="label text-champagne-ink" data-reveal>
              Choose your {product.variantLabel.toLowerCase()}
            </p>
            <h2 id="editions-title" className="display mt-5 text-[clamp(2.5rem,6vw,4.5rem)] text-ink" data-reveal>
              {product.variants.length > 1 ? (
                <>
                  {product.variants.length} ways <span className="italic text-graphite">to wear it.</span>
                </>
              ) : (
                <>
                  One edition, <span className="italic text-graphite">perfected.</span>
                </>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-5">
            <span className="label text-mist">Quantity</span>
            <QuantityStepper id="editions-qty" />
            <span className="num font-serif text-2xl text-ink" aria-live="polite">
              {money(subtotal)}
              <span className="sr-only"> for {quantity}</span>
            </span>
          </div>
        </div>

        <fieldset className="mt-12">
          <legend className="sr-only">{product.variantLabel}</legend>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {product.variants.map((v) => {
              const selected = v.key === variant.key;
              const img = v.images[0] ?? product.images[0];
              return (
                <label
                  key={v.key}
                  className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-[var(--radius-md)] border bg-porcelain transition duration-300 ${
                    selected ? "border-ink shadow-lift" : "border-rule hover:-translate-y-0.5 hover:border-steel hover:shadow-soft"
                  } ${v.available ? "" : "cursor-not-allowed"} has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-ink`}
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
                  <div className="paper relative aspect-[5/4] overflow-hidden">
                    {img ? (
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                        loading="lazy"
                        unoptimized={img.url.endsWith(".svg")}
                        className={`object-cover transition duration-700 group-hover:scale-[1.03] ${v.available ? "" : "grayscale-[60%] opacity-60"}`}
                      />
                    ) : null}
                    <span
                      className={`absolute right-3 top-3 grid size-8 place-items-center rounded-full border transition ${
                        selected ? "border-ink bg-ink text-porcelain" : "border-rule bg-porcelain/90 text-transparent"
                      }`}
                      aria-hidden
                    >
                      <Icon name="check" size={16} strokeWidth={1.8} />
                    </span>
                    {!v.available ? (
                      <span className="label absolute left-3 top-3 rounded-[var(--radius-sm)] bg-ink px-2.5 py-1.5 text-[0.6rem] text-porcelain">
                        Unavailable
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 items-end justify-between gap-4 p-5">
                    <div>
                      <p className="flex items-center gap-2.5 font-serif text-2xl text-ink">
                        {v.swatch ? (
                          <span aria-hidden className="size-3 rounded-full ring-1 ring-rule" style={{ background: v.swatch }} />
                        ) : null}
                        {v.name}
                      </p>
                      <p className="num mt-1 text-xs text-mist">SKU {v.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="num font-serif text-xl text-ink">{money(v.price)}</p>
                      {v.compareAtPrice ? (
                        <p className="num text-xs text-mist line-through">{money(v.compareAtPrice)}</p>
                      ) : null}
                      <p className="mt-0.5 text-xs text-graphite">
                        {v.available ? (v.stock <= 3 ? `${v.stock} available` : "In stock") : "Out of stock"}
                      </p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </fieldset>
        {maxQuantity > 0 && maxQuantity < settings.maxQuantityPerOrder ? (
          <p className="mt-5 text-sm text-mist">Up to {maxQuantity} can be ordered for this {product.variantLabel.toLowerCase()}.</p>
        ) : null}
      </div>
    </section>
  );
}
