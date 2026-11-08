"use client";

import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { trackEvent } from "@/lib/analytics";
import { fillTemplate, formatMoney, telHref, whatsappHref } from "@/lib/format";
import { useStorefront } from "./StorefrontProvider";

export function PriceDisplay({ size = "lg" }: { size?: "lg" | "md" }) {
  const { unitPrice, compareAtPrice, settings } = useStorefront();
  const money = (n: number) => formatMoney(n, settings.currency);
  const onSale = Boolean(compareAtPrice && compareAtPrice > unitPrice);
  const off = onSale ? Math.round(((compareAtPrice! - unitPrice) / compareAtPrice!) * 100) : 0;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span className={`num font-extrabold text-champagne-ink ${size === "lg" ? "text-4xl sm:text-[2.6rem]" : "text-3xl"}`}>
        {money(unitPrice)}
      </span>
      {onSale ? (
        <>
          <span className="num text-lg text-mist line-through decoration-1">
            <span className="sr-only">আগের দাম </span>
            {money(compareAtPrice!)}
          </span>
          {off > 0 ? (
            <span className="num rounded-full bg-offer px-2.5 py-1 text-sm font-bold text-white">{off}% ছাড়</span>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export function StockStatus() {
  const { variant } = useStorefront();
  const inStock = variant.stock > 0;
  return (
    <p
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
        inStock ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
      }`}
      aria-live="polite"
    >
      <span aria-hidden className={`inline-block size-2 rounded-full ${inStock ? "bg-success" : "bg-danger"}`} />
      {inStock ? (
        <span className="num">
          স্টকে আছে
          {variant.stock <= 3 ? <span> · মাত্র {variant.stock}টি বাকি</span> : null}
        </span>
      ) : (
        <span>এই মুহূর্তে স্টকে নেই</span>
      )}
    </p>
  );
}

export function QuantityStepper({ id = "qty" }: { id?: string }) {
  const { quantity, setQuantity, maxQuantity } = useStorefront();
  const disabled = maxQuantity < 1;
  return (
    <div className="inline-flex items-center overflow-hidden rounded-[var(--radius-sm)] border border-rule bg-white">
      <button
        type="button"
        onClick={() => setQuantity(quantity - 1)}
        disabled={disabled || quantity <= 1}
        className="grid size-11 place-items-center text-ink transition hover:bg-linen disabled:text-steel disabled:hover:bg-transparent"
        aria-label="পরিমাণ কমান"
        aria-controls={id}
      >
        <Icon name="minus" size={16} />
      </button>
      <label htmlFor={id} className="sr-only">
        পরিমাণ
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
        className="num h-11 w-12 appearance-none border-x border-rule bg-transparent text-center text-base font-bold text-ink outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => setQuantity(quantity + 1)}
        disabled={disabled || quantity >= maxQuantity}
        className="grid size-11 place-items-center text-ink transition hover:bg-linen disabled:text-steel disabled:hover:bg-transparent"
        aria-label="পরিমাণ বাড়ান"
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
      <legend className="mb-3 text-[0.95rem] font-semibold text-graphite">
        রঙ বাছাই করুন: <span className="text-champagne-ink">{variant.name}</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {product.variants.map((v) => {
          const selected = v.key === variant.key;
          return (
            <label
              key={v.key}
              className={`relative inline-flex min-h-11 items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-3 text-sm sm:pr-4 transition ${
                selected
                  ? "border-champagne bg-champagne-soft text-ink ring-1 ring-champagne"
                  : "border-rule bg-white text-graphite hover:border-champagne"
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
                aria-label={`${v.name}${v.available ? "" : " (স্টক শেষ)"}`}
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
                <span aria-hidden className="text-xs text-mist">
                  স্টক শেষ
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
          className="min-w-0 border-[#25d366] bg-[#25d366] px-3 text-white hover:border-[#1ebe5b] hover:bg-[#1ebe5b] hover:text-white"
          onClick={() => trackEvent("contact", { contact_method: "whatsapp" })}
          icon={<Icon name="whatsapp" size={18} />}
          aria-label="WhatsApp-এ অর্ডার করুন (WhatsApp খুলবে)"
        >
          WhatsApp
        </LinkButton>
      ) : null}
      {phone ? (
        <LinkButton
          href={phone}
          variant="ghost"
          size={compact ? "sm" : "md"}
          className="min-w-0 border-2 border-champagne px-3 text-champagne-ink"
          onClick={() => trackEvent("contact", { contact_method: "phone" })}
          icon={<Icon name="phone" size={18} />}
        >
          কল করুন
        </LinkButton>
      ) : null}
    </div>
  );
}
