"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { captureAttribution } from "@/lib/attribution";
import { checkoutAnalytics, trackEcommerceEvent, trackPurchase } from "@/lib/analytics";
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

/**
 * Pre-select "Outside Dhaka" (most customers are outside the capital); the buyer can still change it.
 * Matched by id or label so it survives renaming in admin. Falls back to the only zone, else none.
 */
function defaultZoneId(zones: { id: string; label: string }[]) {
  if (zones.length === 1) return zones[0]!.id;
  const outside = zones.find((z) => /outside|বাইরে/i.test(`${z.id} ${z.label}`));
  return outside?.id ?? "";
}

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
    zoneId: defaultZoneId(zones),
    email: "",
    note: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);
  const idempotencyKey = useRef<string>("");
  const readyAt = useRef<number>(0);
  const checkoutStarted = useRef(false);
  const warmedUp = useRef(false);
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

    const honeypot = (formRef.current?.elements.namedItem("mri_hp_check") as HTMLInputElement | null)?.value ?? "";
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
        // A confirmed order from the live store is a real sale — always report it
        // (GTM/GA4 "purchase" + Meta Pixel "Purchase"), deduped per order number.
        trackPurchase(order);
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
      setFormError(
        data?.fields
          ? "লাল চিহ্নিত ঘরগুলো ঠিক করে আবার চেষ্টা করুন।"
          : (data?.error ?? "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।"),
      );
      requestAnimationFrame(() => errorRef.current?.focus());
    } catch {
      setFormError("নেটওয়ার্ক সমস্যা — ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন। একই অর্ডার দুইবার হবে না।");
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
      <form
        ref={formRef}
        onSubmit={onSubmit}
        onFocusCapture={() => {
          // Open the server's database connection while the customer is still typing,
          // so "Place order" doesn't wait for a cold connection.
          if (!warmedUp.current && connected) {
            warmedUp.current = true;
            fetch("/api/product", { cache: "no-store" }).catch(() => {});
          }
          if (checkoutStarted.current || !connected) return;
          checkoutStarted.current = true;
          trackEcommerceEvent("begin_checkout", checkoutAnalytics(product, settings, variant, quantity));
        }}
        noValidate
        className="relative rounded-[var(--radius-md)] border border-rule bg-white p-5 shadow-soft sm:p-7 lg:col-span-7"
        aria-describedby="order-form-note"
      >
        {!connected ? (
          <div className="mb-6 flex gap-3 rounded-[var(--radius-sm)] bg-offer-soft px-4 py-3 text-sm text-graphite">
            <Icon name="alert" size={18} className="mt-0.5 shrink-0 text-offer" />
            <p>
              প্রিভিউ মোড — স্টোর ডাটাবেস এখনো যুক্ত হয়নি, তাই এই পেজ থেকে অর্ডার করা যাবে না।
            </p>
          </div>
        ) : null}

        <fieldset className="grid gap-5" disabled={submitting}>
          <legend className="mb-5 flex items-center gap-3 text-lg font-bold text-ink">
            <span className="num grid size-8 place-items-center rounded-full bg-ink text-sm text-champagne-light">1</span>
            আপনার তথ্য
          </legend>
          <TextField
            label="আপনার নাম"
            placeholder="যেমন: মোঃ রহিম"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={set("name")}
            onBlur={() => values.name && validateField("name")}
            error={errors.name}
            maxLength={80}
          />
          <TextField
            label="মোবাইল নম্বর"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
            value={values.phone}
            onChange={set("phone")}
            onBlur={() => values.phone && validateField("phone")}
            error={errors.phone}
            hint="অর্ডার কনফার্ম করতে এই নম্বরে কল করা হবে।"
            maxLength={20}
          />
          <TextField
            label="ইমেইল"
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

        <fieldset className="mt-8 grid gap-5" disabled={submitting}>
          <legend className="mb-5 flex items-center gap-3 text-lg font-bold text-ink">
            <span className="num grid size-8 place-items-center rounded-full bg-ink text-sm text-champagne-light">2</span>
            ডেলিভারি ঠিকানা
          </legend>
          <TextArea
            label="সম্পূর্ণ ঠিকানা"
            name="address"
            autoComplete="street-address"
            placeholder="বাসা নং, রোড, এলাকা, থানা"
            rows={3}
            value={values.address}
            onChange={set("address")}
            onBlur={() => values.address && validateField("address")}
            error={errors.address}
            maxLength={300}
          />
          <TextField
            label="জেলা / শহর"
            placeholder="যেমন: ঢাকা"
            name="city"
            autoComplete="address-level2"
            value={values.city}
            onChange={set("city")}
            onBlur={() => values.city && validateField("city")}
            error={errors.city}
            maxLength={60}
          />

          <div role="radiogroup" aria-labelledby="zone-label" aria-describedby={errors.zoneId ? "zoneId-error" : undefined}>
            <p id="zone-label" className="mb-2 text-[0.95rem] font-semibold text-graphite">
              ডেলিভারি এলাকা
            </p>
            {noZones ? (
              <p className="rounded-[var(--radius-sm)] border border-rule bg-porcelain px-4 py-3 text-sm text-graphite">
                ডেলিভারি এলাকা এখনো যোগ করা হয়নি। অর্ডার করতে আমাদের কল করুন।
              </p>
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {zones.map((z) => {
                  const checked = values.zoneId === z.id;
                  return (
                    <label
                      key={z.id}
                      className={`flex min-h-16 cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-sm)] border px-4 py-3 transition ${
                        checked ? "border-champagne bg-champagne-soft ring-1 ring-champagne" : "border-rule bg-white hover:border-champagne/60"
                      } ${errors.zoneId ? "border-danger" : ""} has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className={`grid size-5 place-items-center rounded-full border-2 ${checked ? "border-champagne" : "border-steel"}`}
                        >
                          {checked ? <span className="size-2.5 rounded-full bg-champagne" /> : null}
                        </span>
                        <span>
                          <span className="block text-[0.95rem] font-bold text-ink">{z.label}</span>
                          {z.description ? <span className="block text-xs text-mist">{z.description}</span> : null}
                        </span>
                      </span>
                      <span className="num text-base font-bold text-champagne-ink">{z.fee === 0 ? "ফ্রি" : money(z.fee)}</span>
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
            label="অতিরিক্ত নোট"
            name="note"
            optional
            rows={2}
            placeholder="ডেলিভারির নির্দেশনা, কখন কল করবেন…"
            value={values.note}
            onChange={set("note")}
            error={errors.note}
            maxLength={500}
          />
        </fieldset>

        <fieldset className="mt-8" disabled={submitting}>
          <legend className="mb-5 flex items-center gap-3 text-lg font-bold text-ink">
            <span className="num grid size-8 place-items-center rounded-full bg-ink text-sm text-champagne-light">3</span>
            পেমেন্ট
          </legend>
          {paymentAvailable ? (
            <div className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border-2 border-champagne bg-champagne-soft px-4 py-4">
              <span className="flex items-center gap-3">
                <Icon name="cash" className="text-champagne-ink" />
                <span>
                  <span className="block text-[0.95rem] font-bold text-ink">ক্যাশ অন ডেলিভারি</span>
                  <span className="block text-sm text-graphite">পণ্য হাতে পেয়ে টাকা পরিশোধ করুন।</span>
                </span>
              </span>
              <Icon name="check" size={20} strokeWidth={2.5} className="text-champagne-ink" />
            </div>
          ) : (
            <p className="rounded-[var(--radius-sm)] border border-rule bg-porcelain px-4 py-3 text-sm text-graphite">
              এই মুহূর্তে অনলাইনে অর্ডার নেওয়া যাচ্ছে না। অর্ডার করতে আমাদের কল করুন।
            </p>
          )}
        </fieldset>

        {/* Honeypot — hidden from people and assistive tech. Deliberately NOT named like a real
            field (e.g. "company"), otherwise browser autofill fills it and real orders get rejected. */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <input
            type="text"
            name="mri_hp_check"
            tabIndex={-1}
            autoComplete="off"
            data-1p-ignore
            data-lpignore="true"
            data-form-type="other"
            defaultValue=""
          />
        </div>

        {submitting ? (
          <div
            role="status"
            aria-live="assertive"
            className="absolute inset-0 z-10 grid place-items-center rounded-[var(--radius-md)] bg-white/85 backdrop-blur-[2px]"
          >
            <div className="flex flex-col items-center gap-4 px-6 text-center">
              <span className="relative grid size-16 place-items-center">
                <span className="absolute inset-0 animate-[spin-slow_0.9s_linear_infinite] rounded-full border-4 border-champagne-soft border-t-champagne" />
                <Icon name="cash" size={24} className="text-champagne-ink" />
              </span>
              <div>
                <p className="text-lg font-bold text-ink">আপনার অর্ডার প্রসেস হচ্ছে…</p>
                <p className="mt-1 text-sm text-graphite">অনুগ্রহ করে পেজটি বন্ধ করবেন না বা আবার চাপবেন না।</p>
              </div>
            </div>
          </div>
        ) : null}

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
            className="w-full whitespace-normal text-xl"
            loading={submitting}
            loadingLabel="অর্ডার হচ্ছে…"
            disabled={soldOut || noZones || !paymentAvailable}
          >
            {soldOut ? "এই রঙটি স্টকে নেই" : `অর্ডার কনফার্ম করুন · ${money(preview.total)}`}
          </Button>
          <p id="order-form-note" className="mt-3 text-center text-xs leading-relaxed text-mist">
            অর্ডার করার সময় সিস্টেম আপনার মোট দাম নিশ্চিত করবে।
            {settings.policies.privacy ? " আপনার তথ্য শুধু অর্ডার ও ডেলিভারির জন্য ব্যবহার করা হবে।" : null}
          </p>
        </div>
      </form>

      <aside className="order-first lg:order-none lg:col-span-5" aria-label="অর্ডার সারাংশ">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)]">
          <div className="rounded-[var(--radius-md)] border border-rule bg-white p-5 shadow-soft sm:p-7">
            <p className="text-lg font-bold text-ink">আপনার অর্ডার</p>
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
                <p className="text-xl font-bold leading-tight text-ink">{product.title}</p>
                <p className="mt-1 text-sm text-graphite">রঙ: {variant.name}</p>
                <p className="num mt-0.5 text-xs text-mist">SKU {variant.sku}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-rule-soft pt-5">
              <span className="text-[0.95rem] font-semibold text-graphite">পরিমাণ</span>
              <QuantityStepper id="order-qty" />
            </div>

            <dl className="num mt-5 space-y-3 border-t border-rule-soft pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-graphite">
                  পণ্যের দাম <span className="text-mist">({quantity} × {money(unitPrice)})</span>
                </dt>
                <dd className="text-ink">{money(preview.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-graphite">ডেলিভারি চার্জ{zone ? <span className="text-mist"> · {zone.label}</span> : null}</dt>
                <dd className="text-ink">{zone ? (zone.fee === 0 ? "ফ্রি" : money(zone.fee)) : "এলাকা বাছাই করুন"}</dd>
              </div>
              {preview.discount > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-graphite">ছাড়</dt>
                  <dd className="text-success">−{money(preview.discount)}</dd>
                </div>
              ) : null}
              <div className="flex items-baseline justify-between border-t border-rule pt-4">
                <dt className="text-base font-bold text-ink">সর্বমোট</dt>
                <dd className="text-3xl font-extrabold text-ink" aria-live="polite">
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
