"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { captureAttribution } from "@/lib/attribution";
import { formatMoney } from "@/lib/format";
import { calculateTotals } from "@/lib/pricing";
import type { OrderConfirmation } from "@/lib/types";
import { customerSchema, fieldErrors } from "@/lib/validation/order";
import { TextArea, TextField } from "./Field";
import { OrderSuccess } from "./OrderSuccess";
import { ContactActions, QuantityStepper } from "./PurchaseControls";
import { useStorefront } from "./StorefrontProvider";

type Values = { name: string; phone: string; address: string; city: string; zoneId: string; email: string; note: string };
const FIELD_ORDER: (keyof Values)[] = ["name", "phone", "address", "city", "zoneId", "email", "note"];
const LAST_ORDER_KEY = "mri:last-order";

function newKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID().replace(/-/g, "");
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

export function OrderForm() {
  const { product, settings, connected, variant, quantity, unitPrice, applyStock, setVariantKey } = useStorefront();
  const zones = settings.shippingZones;
  const [values, setValues] = useState<Values>({
    name: "",
    phone: "",
    address: "",
    city: "",
    zoneId: zones.length === 1 ? zones[0]!.id : "",
    email: "",
    note: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);
  const idempotencyKey = useRef<string>("");
  const readyAt = useRef<number>(0);
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    idempotencyKey.current = newKey();
    readyAt.current = Date.now();
    captureAttribution();

    // Refresh recovery: restore this tab's most recent confirmation using its secret token.
    try {
      const raw = sessionStorage.getItem(LAST_ORDER_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { orderNumber: string; token: string; at: number };
      if (Date.now() - saved.at > 1000 * 60 * 60 * 6) {
        sessionStorage.removeItem(LAST_ORDER_KEY);
        return;
      }
      fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: saved.orderNumber, token: saved.token }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.order) setConfirmation(data.order as OrderConfirmation);
        })
        .catch(() => {});
    } catch {}
  }, []);

  const zone = zones.find((z) => z.id === values.zoneId);
  const preview = calculateTotals({ unitPrice, quantity: Math.max(1, quantity), deliveryFee: zone?.fee ?? 0 });
  const money = (n: number) => formatMoney(n, settings.currency);
  const soldOut = variant.stock < 1;
  const noZones = zones.length === 0;
  const paymentAvailable = settings.codEnabled;

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors(({ [k]: _removed, ...rest }) => rest);
  };

  const validateField = (k: keyof Values) => {
    const shape = customerSchema.shape[k as keyof typeof customerSchema.shape];
    if (!shape) return;
    const res = shape.safeParse(values[k]);
    setErrors((prev) => {
      const next = { ...prev };
      if (res.success) delete next[k];
      else next[k] = res.error.issues[0]?.message ?? "Invalid value";
      return next;
    });
  };

  const focusFirstError = (errs: Record<string, string>) => {
    const first = FIELD_ORDER.find((f) => errs[f]);
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLElement>(first === "zoneId" ? "input[name='zoneId']" : `[name='${first}']`);
    el?.focus();
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);

    const parsed = customerSchema.safeParse(values);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      focusFirstError(errs);
      return;
    }

    const honeypot = (formRef.current?.elements.namedItem("company") as HTMLInputElement | null)?.value ?? "";
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          productId: product.id,
          variantKey: variant.key,
          quantity,
          paymentMethod: "cod",
          idempotencyKey: idempotencyKey.current,
          attribution: captureAttribution(),
          company: honeypot,
          elapsedMs: Date.now() - readyAt.current,
        }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.order) {
        const order = data.order as OrderConfirmation;
        try {
          sessionStorage.setItem(
            LAST_ORDER_KEY,
            JSON.stringify({ orderNumber: order.orderNumber, token: order.accessToken, at: Date.now() }),
          );
        } catch {}
        idempotencyKey.current = newKey();
        setConfirmation(order);
        return;
      }

      if (data?.fields) {
        setErrors(data.fields);
        focusFirstError(data.fields);
      }
      if (data?.code === "OUT_OF_STOCK" && typeof data.available === "number") applyStock(variant.key, data.available);
      setFormError(data?.error ?? "Something went wrong. Please try again.");
      requestAnimationFrame(() => errorRef.current?.focus());
    } catch {
      setFormError("Network error — please check your connection and try again. You won't be charged twice.");
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <OrderSuccess
        order={confirmation}
        onContinue={() => {
          try {
            sessionStorage.removeItem(LAST_ORDER_KEY);
          } catch {}
          setConfirmation(null);
          setValues((v) => ({ ...v, note: "" }));
          setVariantKey(variant.key);
          document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
        }}
      />
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <form ref={formRef} onSubmit={onSubmit} noValidate className="lg:col-span-7" aria-describedby="order-form-note">
        {!connected ? (
          <div className="mb-8 flex gap-3 border-l-2 border-champagne bg-porcelain px-4 py-3 text-sm text-graphite">
            <Icon name="alert" size={18} className="mt-0.5 shrink-0 text-champagne-ink" />
            <p>
              Preview mode — the store database is not connected yet, so orders can&rsquo;t be placed from this page.
            </p>
          </div>
        ) : null}

        <fieldset className="grid gap-5" disabled={submitting}>
          <legend className="label mb-5 text-mist">01 — Your details</legend>
          <TextField
            label="Full name"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={set("name")}
            onBlur={() => values.name && validateField("name")}
            error={errors.name}
            maxLength={80}
          />
          <TextField
            label="Mobile number"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
            value={values.phone}
            onChange={set("phone")}
            onBlur={() => values.phone && validateField("phone")}
            error={errors.phone}
            hint="We'll call this number to confirm your order."
            maxLength={20}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            optional
            value={values.email}
            onChange={set("email")}
            onBlur={() => values.email && validateField("email")}
            error={errors.email}
            maxLength={120}
          />
        </fieldset>

        <fieldset className="mt-10 grid gap-5" disabled={submitting}>
          <legend className="label mb-5 text-mist">02 — Delivery</legend>
          <TextArea
            label="Full delivery address"
            name="address"
            autoComplete="street-address"
            placeholder="House, road, area"
            rows={3}
            value={values.address}
            onChange={set("address")}
            onBlur={() => values.address && validateField("address")}
            error={errors.address}
            maxLength={300}
          />
          <TextField
            label="District / city"
            name="city"
            autoComplete="address-level2"
            value={values.city}
            onChange={set("city")}
            onBlur={() => values.city && validateField("city")}
            error={errors.city}
            maxLength={60}
          />

          <div role="radiogroup" aria-labelledby="zone-label" aria-describedby={errors.zoneId ? "zoneId-error" : undefined}>
            <p id="zone-label" className="mb-2 text-[0.8rem] font-semibold text-graphite">
              Delivery area
            </p>
            {noZones ? (
              <p className="rounded-[var(--radius-sm)] border border-rule bg-porcelain px-4 py-3 text-sm text-graphite">
                Delivery areas haven&rsquo;t been published yet. Please contact us to order.
              </p>
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {zones.map((z) => {
                  const checked = values.zoneId === z.id;
                  return (
                    <label
                      key={z.id}
                      className={`flex min-h-16 cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-sm)] border px-4 py-3 transition ${
                        checked ? "border-ink bg-porcelain shadow-soft" : "border-rule bg-porcelain/60 hover:border-steel"
                      } ${errors.zoneId ? "border-danger" : ""} has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className={`grid size-4 place-items-center rounded-full border ${checked ? "border-ink" : "border-steel"}`}
                        >
                          {checked ? <span className="size-2 rounded-full bg-ink" /> : null}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-ink">{z.label}</span>
                          {z.description ? <span className="block text-xs text-mist">{z.description}</span> : null}
                        </span>
                      </span>
                      <span className="num text-sm text-graphite">{z.fee === 0 ? "Free" : money(z.fee)}</span>
                      <input
                        type="radio"
                        name="zoneId"
                        value={z.id}
                        checked={checked}
                        onChange={() => {
                          setValues((s) => ({ ...s, zoneId: z.id }));
                          setErrors(({ zoneId: _z, ...rest }) => rest);
                        }}
                        className="sr-only"
                      />
                    </label>
                  );
                })}
              </div>
            )}
            {errors.zoneId ? (
              <p id="zoneId-error" className="mt-1.5 text-[0.8rem] text-danger">
                {errors.zoneId}
              </p>
            ) : null}
          </div>

          <TextArea
            label="Order note"
            name="note"
            optional
            rows={2}
            placeholder="Delivery instructions, preferred call time…"
            value={values.note}
            onChange={set("note")}
            error={errors.note}
            maxLength={500}
          />
        </fieldset>

        <fieldset className="mt-10" disabled={submitting}>
          <legend className="label mb-5 text-mist">03 — Payment</legend>
          {paymentAvailable ? (
            <div className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-ink bg-porcelain px-4 py-4 shadow-soft">
              <span className="flex items-center gap-3">
                <Icon name="cash" className="text-graphite" />
                <span>
                  <span className="block text-sm font-semibold text-ink">Cash on delivery</span>
                  <span className="block text-xs text-mist">Pay when your order arrives.</span>
                </span>
              </span>
              <Icon name="check" size={18} className="text-ink" />
            </div>
          ) : (
            <p className="rounded-[var(--radius-sm)] border border-rule bg-porcelain px-4 py-3 text-sm text-graphite">
              No payment method is currently available online. Please contact us to order.
            </p>
          )}
        </fieldset>

        {/* Honeypot — hidden from people and assistive tech */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Company
            <input type="text" name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>

        {formError ? (
          <div
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className="mt-8 flex gap-3 rounded-[var(--radius-sm)] border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger outline-none"
          >
            <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
            <p>{formError}</p>
          </div>
        ) : null}

        <div className="mt-8">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={submitting}
            loadingLabel="Placing your order…"
            disabled={soldOut || noZones || !paymentAvailable}
          >
            {soldOut ? "Selected option unavailable" : `Place order · ${money(preview.total)}`}
          </Button>
          <p id="order-form-note" className="mt-3 text-center text-xs leading-relaxed text-mist">
            Your total is confirmed by our system when you place the order.
            {settings.policies.privacy ? " Details are used only to process and deliver your order." : null}
          </p>
        </div>
      </form>

      <aside className="lg:col-span-5" aria-label="Order summary">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)]">
          <div className="rounded-[var(--radius-md)] border border-rule bg-porcelain p-5 shadow-soft sm:p-7">
            <p className="label text-mist">Order summary</p>
            <div className="mt-5 flex gap-4">
              <div className="paper relative h-24 w-20 shrink-0 overflow-hidden rounded-[var(--radius-sm)] ring-1 ring-rule-soft">
                {(variant.images[0] ?? product.images[0]) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={(variant.images[0] ?? product.images[0])!.url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-2xl leading-tight text-ink">{product.title}</p>
                <p className="mt-1 text-sm text-graphite">{variant.name}</p>
                <p className="num mt-0.5 text-xs text-mist">SKU {variant.sku}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-rule-soft pt-5">
              <span className="text-sm text-graphite">Quantity</span>
              <QuantityStepper id="order-qty" />
            </div>

            <dl className="num mt-5 space-y-3 border-t border-rule-soft pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-graphite">
                  Subtotal <span className="text-mist">({quantity} × {money(unitPrice)})</span>
                </dt>
                <dd className="text-ink">{money(preview.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-graphite">Delivery{zone ? <span className="text-mist"> · {zone.label}</span> : null}</dt>
                <dd className="text-ink">{zone ? (zone.fee === 0 ? "Free" : money(zone.fee)) : "Select area"}</dd>
              </div>
              {preview.discount > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-graphite">Discount</dt>
                  <dd className="text-success">−{money(preview.discount)}</dd>
                </div>
              ) : null}
              <div className="flex items-baseline justify-between border-t border-rule pt-4">
                <dt className="label text-ink">Total payable</dt>
                <dd className="font-serif text-3xl text-ink" aria-live="polite">
                  {money(preview.total)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-5">
            <ContactActions compact />
          </div>
        </div>
      </aside>
    </div>
  );
}
