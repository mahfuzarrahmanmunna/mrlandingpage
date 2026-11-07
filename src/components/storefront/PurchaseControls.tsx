"use client";

import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { trackEvent } from "@/lib/analytics";
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
    <p
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
        inStock ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
      }`}
      aria-live="polite"
    >
      <span aria-hidden className={`inline-block size-2 rounded-full ${inStock ? "bg-success" : "bg-danger"}`} />
      {inStock ? (
        <span>
          In stock
          {variant.stock <= 3 ? <span> · only {variant.stock} left</span> : null}
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
      <legend className="mb-3 text-sm text-graphite">
        {product.variantLabel}: <span className="font-semibold text-ink">{variant.name}</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {product.variants.map((v) => {
          const selected = v.key === variant.key;
          return (
            <label
              key={v.key}
              className={`relative inline-flex min-h-11 items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-3 text-sm sm:pr-4 transition ${
                selected
                  ? "border-ink bg-porcelain text-ink shadow-soft"
                  : "border-rule bg-porcelain/60 text-graphite hover:border-graphite"
              } ${v.available ? "cursor-pointer" : "cursor-not-allowed opacity-50"} has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink`}
            >
              <input
                type="radio"
                name="variant-swatch"
                value={v.key}
                checked={selected}
                disabled={!v.available}
                onChange={() => setVariantKey(v.key)}
                className="sr-only"
                aria-label={`${v.name}${v.available ? "" : " (sold out)"}`}
              />
              <span
                aria-hidden
                className="size-6 shrink-0 rounded-full ring-1 sm:size-7 ring-black/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.18)]"
                style={{ background: v.swatch ?? "var(--linen)" }}
              />
              <span aria-hidden className={selected ? "font-semibold" : ""}>
                {v.name}
              </span>
              {!v.available ? (
                <span aria-hidden className="text-[0.6rem] uppercase tracking-wider text-mist">
                  Sold out
                </span>
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
    <div className={`grid min-w-0 gap-2.5 ${whatsapp && phone ? "grid-cols-2" : "grid-cols-1"}`}>
      {whatsapp ? (
        <LinkButton
          href={whatsapp}
          external
          variant="ghost"
          size={compact ? "sm" : "md"}
          className="min-w-0 px-3"
          onClick={() => trackEvent("contact", { contact_method: "whatsapp" })}
          icon={<Icon name="whatsapp" size={18} />}
          aria-label="Order on WhatsApp (opens WhatsApp)"
        >
          WhatsApp
        </LinkButton>
      ) : null}
      {phone ? (
        <LinkButton
          href={phone}
          variant="ghost"
          size={compact ? "sm" : "md"}
          className="min-w-0 px-3"
          onClick={() => trackEvent("contact", { contact_method: "phone" })}
          icon={<Icon name="phone" size={18} />}
        >
          Call us
        </LinkButton>
      ) : null}
    </div>
  );
}
