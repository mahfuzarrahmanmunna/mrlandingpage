"use client";

import { useState } from "react";
import { ListEditor } from "./ListEditor";
import { SaveBar } from "./SaveBar";
import { AdminField, Card, inputCls } from "./ui";
import { useAdminRequest } from "./useAdminSave";
import { SPEC_FIELDS, type Img, type ProductForm } from "./product-form";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

function ImagesEditor({ items, onChange, max = 12 }: { items: Img[]; onChange: (v: Img[]) => void; max?: number }) {
  return (
    <ListEditor
      items={items}
      onChange={onChange}
      max={max}
      addLabel="Add image"
      empty="No images yet. Upload photos to your image storage (e.g. Cloudinary/S3) and paste the https URL."
      create={() => ({ url: "", alt: "", placeholder: false })}
      render={(img, update) => (
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <AdminField label="Image URL">
            <input className={inputCls} value={img.url} onChange={(e) => update({ url: e.target.value })} placeholder="https://res.cloudinary.com/…" />
          </AdminField>
          <AdminField label="Alt text (describe the image)">
            <input className={inputCls} value={img.alt} onChange={(e) => update({ alt: e.target.value })} />
          </AdminField>
          <label className="flex min-h-10 items-center gap-2 text-xs text-graphite">
            <input type="checkbox" checked={img.placeholder} onChange={(e) => update({ placeholder: e.target.checked })} />
            Placeholder
          </label>
        </div>
      )}
    />
  );
}

export function ProductEditor({ initial }: { initial: ProductForm }) {
  const [form, setForm] = useState<ProductForm>(initial);
  const { send, saving, errors, message } = useAdminRequest();
  const set = <K extends keyof ProductForm>(k: K, v: ProductForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const err = (k: string) => errors[k];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await send(
      "/api/admin/product",
      "PUT",
      { ...form, highlights: form.highlights.map((h) => h.trim()).filter(Boolean) },
      "Product saved. The storefront has been refreshed.",
    );
  }

  const variantErrors = Object.entries(errors).filter(([k]) => k.startsWith("variants"));

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <Card title="Basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Title" error={err("title")}>
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm((f) => ({ ...f, title, slug: f.slug && f.slug !== slugify(f.title) ? f.slug : slugify(title) }));
              }}
            />
          </AdminField>
          <AdminField label="Slug" error={err("slug")}>
            <input className={inputCls} value={form.slug} onChange={(e) => set("slug", e.target.value)} />
          </AdminField>
          <AdminField label="Tagline" error={err("tagline")} className="sm:col-span-2">
            <input className={inputCls} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </AdminField>
          <AdminField label="Description" error={err("description")} className="sm:col-span-2">
            <textarea rows={5} className={inputCls} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </AdminField>
          <AdminField label="Status" hint="Only an active product is shown on the storefront.">
            <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value as ProductForm["status"])}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </AdminField>
          <label className="flex items-center gap-3 self-end rounded-[var(--radius-sm)] border border-rule-soft bg-ivory px-3 py-3 text-sm text-graphite">
            <input type="checkbox" checked={form.isDemo} onChange={(e) => set("isDemo", e.target.checked)} />
            Preview / demo content (shows a notice and hides the page from search engines)
          </label>
        </div>
      </Card>

      <Card title="Base price & reference">
        <div className="grid gap-4 sm:grid-cols-3">
          <AdminField label="Price (৳)" error={err("price")} hint="Variants have their own prices.">
            <input inputMode="numeric" className={inputCls} value={form.price} onChange={(e) => set("price", e.target.value)} />
          </AdminField>
          <AdminField label="Compare-at price (৳)" error={err("compareAtPrice")} hint="Only if genuinely previously sold at this price.">
            <input inputMode="numeric" className={inputCls} value={form.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value)} />
          </AdminField>
          <AdminField label="SKU" error={err("sku")}>
            <input className={inputCls} value={form.sku} onChange={(e) => set("sku", e.target.value)} />
          </AdminField>
        </div>
      </Card>

      <Card title="Product images">
        <ImagesEditor items={form.images} onChange={(v) => set("images", v)} />
        {Object.entries(errors)
          .filter(([k]) => k.startsWith("images"))
          .map(([k, v]) => (
            <p key={k} className="mt-2 text-xs text-danger">
              {k}: {v}
            </p>
          ))}
        <div className="mt-5">
          <AdminField label="3D model URL (.glb / .gltf, optional)" error={err("modelUrl")} hint="Only a model of this exact watch. Leave empty to use photos (and the labelled illustrative preview if enabled in settings).">
            <input className={inputCls} value={form.modelUrl} onChange={(e) => set("modelUrl", e.target.value)} placeholder="https://…/meridian.glb" />
          </AdminField>
        </div>
      </Card>

      <Card title="Specifications — leave blank anything not verified">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SPEC_FIELDS.map(([k, label]) => (
            <AdminField key={k} label={label} error={err(`specs.${k}`)}>
              <input
                className={inputCls}
                value={form.specs[k] ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, specs: { ...f.specs, [k]: e.target.value } }))}
              />
            </AdminField>
          ))}
        </div>
      </Card>

      <Card title="Variants, stock & pricing">
        <div className="mb-4 max-w-xs">
          <AdminField label="Variant label" hint="e.g. Edition, Colour, Strap">
            <input className={inputCls} value={form.variantLabel} onChange={(e) => set("variantLabel", e.target.value)} />
          </AdminField>
        </div>
        <ListEditor
          items={form.variants}
          onChange={(v) => set("variants", v)}
          max={24}
          addLabel="Add variant"
          create={() => ({
            key: "",
            name: "",
            sku: "",
            price: form.price,
            compareAtPrice: "",
            stock: 0,
            swatch: "",
            images: [],
            active: true,
            lowStockThreshold: 3,
          })}
          render={(v, update, i) => (
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <AdminField label="Name" error={errors[`variants.${i}.name`]}>
                  <input
                    className={inputCls}
                    value={v.name}
                    onChange={(e) => update({ name: e.target.value, ...(v.key ? {} : { key: slugify(e.target.value) }) })}
                  />
                </AdminField>
                <AdminField label="Key (URL-safe, unique)" error={errors[`variants.${i}.key`]}>
                  <input className={inputCls} value={v.key} onChange={(e) => update({ key: e.target.value })} />
                </AdminField>
                <AdminField label="SKU" error={errors[`variants.${i}.sku`]}>
                  <input className={inputCls} value={v.sku} onChange={(e) => update({ sku: e.target.value })} />
                </AdminField>
                <AdminField label="Swatch colour" error={errors[`variants.${i}.swatch`]}>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      aria-label="Pick swatch colour"
                      value={/^#[0-9a-f]{6}$/i.test(v.swatch) ? v.swatch : "#efe7d8"}
                      onChange={(e) => update({ swatch: e.target.value })}
                      className="h-10 w-12 rounded border border-rule bg-ivory"
                    />
                    <input className={inputCls} value={v.swatch} onChange={(e) => update({ swatch: e.target.value })} placeholder="#1f2430" />
                  </div>
                </AdminField>
                <AdminField label="Price (৳)" error={errors[`variants.${i}.price`]}>
                  <input inputMode="numeric" className={inputCls} value={v.price} onChange={(e) => update({ price: e.target.value })} />
                </AdminField>
                <AdminField label="Compare-at (৳)" error={errors[`variants.${i}.compareAtPrice`]}>
                  <input inputMode="numeric" className={inputCls} value={v.compareAtPrice} onChange={(e) => update({ compareAtPrice: e.target.value })} />
                </AdminField>
                <AdminField label="Stock on hand" error={errors[`variants.${i}.stock`]} hint="Orders decrease this automatically.">
                  <input inputMode="numeric" className={inputCls} value={v.stock} onChange={(e) => update({ stock: e.target.value })} />
                </AdminField>
                <AdminField label="Low-stock alert at" error={errors[`variants.${i}.lowStockThreshold`]}>
                  <input inputMode="numeric" className={inputCls} value={v.lowStockThreshold} onChange={(e) => update({ lowStockThreshold: e.target.value })} />
                </AdminField>
              </div>
              <label className="flex items-center gap-2 text-sm text-graphite">
                <input type="checkbox" checked={v.active} onChange={(e) => update({ active: e.target.checked })} />
                Visible on storefront
              </label>
              <details className="rounded-[var(--radius-sm)] border border-rule-soft p-3">
                <summary className="cursor-pointer text-sm text-graphite">Variant images ({v.images.length})</summary>
                <div className="mt-3">
                  <ImagesEditor items={v.images} onChange={(images) => update({ images })} />
                </div>
              </details>
            </div>
          )}
        />
        {variantErrors.length ? (
          <ul className="mt-3 space-y-1 text-xs text-danger">
            {variantErrors.map(([k, v]) => (
              <li key={k}>
                {k}: {v}
              </li>
            ))}
          </ul>
        ) : null}
      </Card>

      <Card title="Hero highlights (short, factual)">
        <AdminField label="One per line (max 8)" hint="e.g. 40 mm case · Quartz movement">
          <textarea
            rows={4}
            className={inputCls}
            value={form.highlights.join("\n")}
            onChange={(e) => set("highlights", e.target.value.split("\n").slice(0, 8))}
          />
        </AdminField>
      </Card>

      <Card title="SEO">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="SEO title" error={err("seo.title")}>
            <input className={inputCls} value={form.seo.title} onChange={(e) => set("seo", { ...form.seo, title: e.target.value })} />
          </AdminField>
          <AdminField label="Open Graph image URL" error={err("seo.ogImage")}>
            <input className={inputCls} value={form.seo.ogImage} onChange={(e) => set("seo", { ...form.seo, ogImage: e.target.value })} />
          </AdminField>
          <AdminField label="Meta description" error={err("seo.description")} className="sm:col-span-2">
            <textarea rows={2} className={inputCls} value={form.seo.description} onChange={(e) => set("seo", { ...form.seo, description: e.target.value })} />
          </AdminField>
        </div>
      </Card>

      <SaveBar saving={saving} message={message} label="Save product" />
    </form>
  );
}
