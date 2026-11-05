"use client";

import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { fillTemplate, formatMoney, telHref, whatsappHref } from "@/lib/format";
import { useStorefront } from "./StorefrontProvider";

export function PriceDisplay({ size = "lg" }: { size?: "lg" | "md" }) {
  const { unitPrice, compareAtPrice, settings } = useStorefront();
  return (
    <p className="flex items-baseline gap-3">
      <span className={`num font-serif text-ink ${size === "lg" ? "text-4xl sm:text-[2.75rem]" : "text-3xl"}`}>
        {formatMoney(unitPrice, settings.currency)}
      </span>
      {compareAtPrice && compareAtPrice > unitPrice ? (
        <span className="num text-base text-mist line-through decoration-1">
          <span className="sr-only">Regular price </span>
          {formatMoney(compareAtPrice, settings.currency)}
        </span>
      ) : null}
    </p>
  );
}

export function StockStatus() {
  const { variant } = useStorefront();
  const inStock = variant.stock > 0;
  return (
    <p className="flex items-center gap-2 text-sm text-graphite" aria-live="polite">
      <span
        aria-hidden
        className={`inline-block size-1.5 rounded-full ${inStock ? "bg-success" : "bg-danger"}`}
      />
      {inStock ? (
        <span>
          In stock
          {variant.stock <= 3 ? <span className="text-mist"> · {variant.stock} available</span> : null}
        </span>
      ) : (
        <span>Currently unavailable</span>
      )}
    </p>
  );
}

export function QuantityStepper({ id = "qty" }: { id?: string }) {
  const { quantity, setQuantity, maxQuantity } = useStorefront();
  const disabled = maxQuantity < 1;
  return (
    <div className="inline-flex items-center rounded-[var(--radius-sm)] border border-rule bg-porcelain">
      <button
        type="button"
        onClick={() => setQuantity(quantity - 1)}
        disabled={disabled || quantity <= 1}
        className="grid size-11 place-items-center text-ink transition hover:bg-linen disabled:text-steel disabled:hover:bg-transparent"
        aria-label="Decrease quantity"
        aria-controls={id}
      >
        <Icon name="minus" size={16} />
      </button>
      <label htmlFor={id} className="sr-only">
        Quantity
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={1}
        max={Math.max(1, maxQuantity)}
        value={disabled ? 0 : quantity}
        disabled={disabled}
        onChange={(e) => setQuantity(Number(e.target.value))}
        className="num h-11 w-11 appearance-none bg-transparent text-center text-sm font-semibold text-ink outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => setQuantity(quantity + 1)}
        disabled={disabled || quantity >= maxQuantity}
        className="grid size-11 place-items-center text-ink transition hover:bg-linen disabled:text-steel disabled:hover:bg-transparent"
        aria-label="Increase quantity"
        aria-controls={id}
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}

export function VariantSwatches() {
  const { product, variant, setVariantKey } = useStorefront();
  if (product.variants.length < 2) return null;
  return (
    <fieldset>
      <legend className="label mb-3 text-mist">
        {product.variantLabel} <span className="text-ink">— {variant.name}</span>
      </legend>
      <div className="flex flex-wrap gap-2.5">
        {product.variants.map((v) => {
          const selected = v.key === variant.key;
          return (
            <label
              key={v.key}
              className={`relative grid size-11 cursor-pointer place-items-center rounded-full transition ${
                selected ? "ring-1 ring-ink ring-offset-2 ring-offset-ivory" : "ring-1 ring-rule hover:ring-graphite"
              } ${v.available ? "" : "cursor-not-allowed opacity-45"} has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-ink`}
              title={`${v.name}${v.available ? "" : " — unavailable"}`}
            >
              <input
                type="radio"
                name="variant-swatch"
                value={v.key}
                checked={selected}
                disabled={!v.available}
                onChange={() => setVariantKey(v.key)}
                className="sr-only"
                aria-label={`${v.name}${v.available ? "" : " (unavailable)"}`}
              />
              <span
                aria-hidden
                className="size-8 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.18)]"
                style={{ background: v.swatch ?? "var(--linen)" }}
              />
              {!v.available ? (
                <span aria-hidden className="absolute h-px w-9 rotate-45 bg-graphite" />
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function useContactLinks() {
  const { settings, product, variant, quantity } = useStorefront();
  const message = fillTemplate(settings.whatsappMessage, {
    product: product.title,
    variant: variant.name,
    quantity,
    sku: variant.sku,
  });
  return {
    whatsapp: settings.contact.whatsapp ? whatsappHref(settings.contact.whatsapp, message) : null,
    phone: settings.contact.phone ? telHref(settings.contact.phone) : null,
    phoneLabel: settings.contact.phone,
  };
}

export function ContactActions({ compact = false }: { compact?: boolean }) {
  const { whatsapp, phone } = useContactLinks();
  if (!whatsapp && !phone) return null;
  return (
    <div className={`grid gap-2.5 ${whatsapp && phone ? "grid-cols-2" : "grid-cols-1"}`}>
      {whatsapp ? (
        <LinkButton
          href={whatsapp}
          external
          variant="ghost"
          size={compact ? "sm" : "md"}
          icon={<Icon name="whatsapp" size={18} />}
          aria-label="Order on WhatsApp (opens WhatsApp)"
        >
          WhatsApp
        </LinkButton>
      ) : null}
      {phone ? (
        <LinkButton href={phone} variant="ghost" size={compact ? "sm" : "md"} icon={<Icon name="phone" size={18} />}>
          Call us
        </LinkButton>
      ) : null}
    </div>
  );
}
