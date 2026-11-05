"use client";

import { useState } from "react";
import { ListEditor } from "./ListEditor";
import { SaveBar } from "./SaveBar";
import { ICONS, type HighlightRow, type SettingsForm } from "./settings-form";
import { AdminField, Card, inputCls } from "./ui";
import { useAdminRequest } from "./useAdminSave";

function HighlightList({ items, onChange, max, addLabel }: { items: HighlightRow[]; onChange: (v: HighlightRow[]) => void; max: number; addLabel: string }) {
  return (
    <ListEditor
      items={items}
      onChange={onChange}
      max={max}
      addLabel={addLabel}
      empty="None yet — this section is hidden on the storefront until you add verified items."
      create={(): HighlightRow => ({ icon: "spark", title: "", text: "" })}
      render={(h, update) => (
        <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
          <AdminField label="Icon">
            <select className={inputCls} value={h.icon} onChange={(e) => update({ icon: e.target.value as HighlightRow["icon"] })}>
              {ICONS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField label="Title">
            <input className={inputCls} value={h.title} onChange={(e) => update({ title: e.target.value })} />
          </AdminField>
          <AdminField label="Text" className="sm:col-span-2">
            <input className={inputCls} value={h.text} onChange={(e) => update({ text: e.target.value })} />
          </AdminField>
        </div>
      )}
    />
  );
}

export function SettingsEditor({ initial }: { initial: SettingsForm }) {
  const [form, setForm] = useState<SettingsForm>(initial);
  const { send, saving, errors, message } = useAdminRequest();
  const set = <K extends keyof SettingsForm>(k: K, v: SettingsForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const nested =
    <K extends "hero" | "currency" | "contact" | "social" | "policies">(k: K, field: keyof SettingsForm[K]) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: { ...f[k], [field]: e.target.value } }));
  const err = (k: string) => errors[k];
  const listErrors = (prefix: string) =>
    Object.entries(errors)
      .filter(([k]) => k.startsWith(prefix))
      .map(([k, v]) => (
        <p key={k} className="mt-2 text-xs text-danger">
          {k}: {v}
        </p>
      ));

  return (
    <form
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        await send("/api/admin/settings", "PUT", form, "Settings saved. The storefront has been refreshed.");
      }}
      className="grid gap-6"
    >
      <Card title="Brand">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Brand name" error={err("brandName")}>
            <input className={inputCls} value={form.brandName} onChange={(e) => set("brandName", e.target.value)} />
          </AdminField>
          <AdminField label="Logo URL (optional)" error={err("logoUrl")} hint="Leave empty to use the typographic wordmark.">
            <input className={inputCls} value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} />
          </AdminField>
          <AdminField label="Announcement line (optional)" error={err("announcement")} hint="Only publish verified claims." className="sm:col-span-2">
            <input className={inputCls} value={form.announcement} onChange={(e) => set("announcement", e.target.value)} />
          </AdminField>
        </div>
      </Card>

      <Card title="Hero copy">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Eyebrow" error={err("hero.eyebrow")}>
            <input className={inputCls} value={form.hero.eyebrow} onChange={nested("hero", "eyebrow")} />
          </AdminField>
          <AdminField label="Headline (defaults to product title)" error={err("hero.headline")}>
            <input className={inputCls} value={form.hero.headline} onChange={nested("hero", "headline")} />
          </AdminField>
          <AdminField label="Sub-headline" error={err("hero.subheadline")} className="sm:col-span-2">
            <input className={inputCls} value={form.hero.subheadline} onChange={nested("hero", "subheadline")} />
          </AdminField>
        </div>
      </Card>

      <Card title="Contact — actions are hidden when empty">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Phone (click-to-call)" error={err("contact.phone")} hint="e.g. +8801XXXXXXXXX">
            <input className={inputCls} value={form.contact.phone} onChange={nested("contact", "phone")} />
          </AdminField>
          <AdminField label="WhatsApp number" error={err("contact.whatsapp")} hint="Include country code, e.g. +8801XXXXXXXXX">
            <input className={inputCls} value={form.contact.whatsapp} onChange={nested("contact", "whatsapp")} />
          </AdminField>
          <AdminField label="Email" error={err("contact.email")}>
            <input className={inputCls} value={form.contact.email} onChange={nested("contact", "email")} />
          </AdminField>
          <AdminField label="Business hours" error={err("contact.hours")}>
            <input className={inputCls} value={form.contact.hours} onChange={nested("contact", "hours")} />
          </AdminField>
          <AdminField label="Address" error={err("contact.address")} className="sm:col-span-2">
            <input className={inputCls} value={form.contact.address} onChange={nested("contact", "address")} />
          </AdminField>
          <AdminField label="WhatsApp message template" error={err("whatsappMessage")} hint="Placeholders: {product} {variant} {quantity} {sku}" className="sm:col-span-2">
            <input className={inputCls} value={form.whatsappMessage} onChange={(e) => set("whatsappMessage", e.target.value)} />
          </AdminField>
        </div>
      </Card>

      <Card title="Social links">
        <div className="grid gap-4 sm:grid-cols-2">
          {(["facebook", "instagram", "tiktok", "youtube"] as const).map((k) => (
            <AdminField key={k} label={k[0]!.toUpperCase() + k.slice(1)} error={err(`social.${k}`)}>
              <input className={inputCls} value={form.social[k]} onChange={nested("social", k)} placeholder="https://" />
            </AdminField>
          ))}
        </div>
      </Card>

      <Card title="Delivery zones & fees">
        <ListEditor
          items={form.shippingZones}
          onChange={(v) => set("shippingZones", v)}
          max={20}
          addLabel="Add delivery zone"
          empty="No zones — customers cannot place orders until at least one active zone exists."
          create={() => ({ id: "", label: "", fee: 0, description: "", active: true })}
          render={(z, update) => (
            <div className="grid gap-3 sm:grid-cols-4">
              <AdminField label="Label">
                <input
                  className={inputCls}
                  value={z.label}
                  onChange={(e) =>
                    update({
                      label: e.target.value,
                      ...(z.id ? {} : { id: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }),
                    })
                  }
                />
              </AdminField>
              <AdminField label="Id">
                <input className={inputCls} value={z.id} onChange={(e) => update({ id: e.target.value })} />
              </AdminField>
              <AdminField label="Fee (৳)">
                <input inputMode="numeric" className={inputCls} value={z.fee} onChange={(e) => update({ fee: e.target.value })} />
              </AdminField>
              <label className="flex items-end gap-2 pb-2.5 text-sm text-graphite">
                <input type="checkbox" checked={z.active} onChange={(e) => update({ active: e.target.checked })} /> Active
              </label>
              <AdminField label="Description (e.g. delivery time — only if reliable)" className="sm:col-span-4">
                <input className={inputCls} value={z.description} onChange={(e) => update({ description: e.target.value })} />
              </AdminField>
            </div>
          )}
        />
        {listErrors("shippingZones")}
      </Card>

      <Card title="Payment & ordering">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-[var(--radius-sm)] border border-rule-soft bg-ivory px-3 py-3 text-sm text-graphite">
            <input type="checkbox" checked={form.codEnabled} onChange={(e) => set("codEnabled", e.target.checked)} />
            Cash on delivery enabled
          </label>
          <div className="rounded-[var(--radius-sm)] border border-rule-soft bg-ivory px-3 py-3 text-sm text-mist">
            Online payment: not integrated yet (requires a gateway — see README).
          </div>
          <AdminField label="Max quantity per order" error={err("maxQuantityPerOrder")}>
            <input inputMode="numeric" className={inputCls} value={form.maxQuantityPerOrder} onChange={(e) => set("maxQuantityPerOrder", e.target.value)} />
          </AdminField>
          <div className="grid grid-cols-2 gap-3">
            <AdminField label="Currency code" error={err("currency.code")}>
              <input className={inputCls} value={form.currency.code} onChange={nested("currency", "code")} />
            </AdminField>
            <AdminField label="Symbol" error={err("currency.symbol")}>
              <input className={inputCls} value={form.currency.symbol} onChange={nested("currency", "symbol")} />
            </AdminField>
          </div>
          <label className="flex items-center gap-3 rounded-[var(--radius-sm)] border border-rule-soft bg-ivory px-3 py-3 text-sm text-graphite sm:col-span-2">
            <input type="checkbox" checked={form.show3DPreview} onChange={(e) => set("show3DPreview", e.target.checked)} />
            Show the labelled illustrative 3D preview when no real 3D model is uploaded
          </label>
        </div>
      </Card>

      <Card title="Trust highlights (below the hero)">
        <HighlightList items={form.trustHighlights} onChange={(v) => set("trustHighlights", v)} max={6} addLabel="Add highlight" />
        {listErrors("trustHighlights")}
      </Card>

      <Card title="Why choose us">
        <HighlightList items={form.whyChoose} onChange={(v) => set("whyChoose", v)} max={8} addLabel="Add reason" />
        {listErrors("whyChoose")}
      </Card>

      <Card title="Testimonials — real customers only; unapproved ones are never shown">
        <ListEditor
          items={form.testimonials}
          onChange={(v) => set("testimonials", v)}
          max={20}
          addLabel="Add testimonial"
          create={() => ({ name: "", location: "", text: "", approved: false })}
          render={(t, update) => (
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminField label="Customer name">
                <input className={inputCls} value={t.name} onChange={(e) => update({ name: e.target.value })} />
              </AdminField>
              <AdminField label="Location">
                <input className={inputCls} value={t.location} onChange={(e) => update({ location: e.target.value })} />
              </AdminField>
              <AdminField label="Testimonial" className="sm:col-span-2">
                <textarea rows={2} className={inputCls} value={t.text} onChange={(e) => update({ text: e.target.value })} />
              </AdminField>
              <label className="flex items-center gap-2 text-sm text-graphite">
                <input type="checkbox" checked={t.approved} onChange={(e) => update({ approved: e.target.checked })} />
                Approved by the customer for publication
              </label>
            </div>
          )}
        />
        {listErrors("testimonials")}
      </Card>

      <Card title="Policies (shown in the footer when filled in)">
        <div className="grid gap-4">
          {(
            [
              ["shipping", "Delivery policy"],
              ["returns", "Returns & exchanges"],
              ["warranty", "Warranty"],
              ["privacy", "Privacy notice"],
            ] as const
          ).map(([k, label]) => (
            <AdminField key={k} label={label} error={err(`policies.${k}`)}>
              <textarea rows={4} className={inputCls} value={form.policies[k]} onChange={nested("policies", k)} />
            </AdminField>
          ))}
        </div>
      </Card>

      <SaveBar saving={saving} message={message} label="Save settings" />
    </form>
  );
}
