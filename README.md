# MR Imperial — single-page watch store

A one-page, mobile-first luxury watch storefront (light ivory / champagne
palette) with real ordering, inventory, lead capture and a protected admin
dashboard.

- **Public:** `/` — hero + gallery (optional 3D), selection, highlights,
  specifications, editions, order form with same-page confirmation, why-us,
  final CTA, footer. Nothing else is public.
- **Admin:** `/admin` — overview, orders, leads, product editor, store settings.

Stack: Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS 4,
MongoDB + Mongoose, Zod, React Three Fiber + Drei, GSAP + ScrollTrigger, Lenis,
`jose` sessions, `bcryptjs`, Vitest.

---

## Quick start

```bash
npm install
cp .env.example .env.local      # fill in the values (see below)
npm run seed                    # preview product + default settings (flagged as demo)
npm run admin:create            # creates the owner account from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev                     # http://localhost:3000  ·  admin: /admin
```

Without `MONGODB_URI`, the page still renders with clearly-labelled preview
content, and order/enquiry submission returns "not available yet".

| Script | Purpose |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` · `npm run typecheck` · `npm test` | ESLint · `tsc` · Vitest (uses an in-memory MongoDB) |
| `npm run seed [-- --force]` | Insert preview product/settings (never overwrites unless `--force`) |
| `npm run admin:create [-- --reset \| --staff]` | Create an admin; `--reset` changes the password and signs out all sessions |

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `MONGODB_URI` | yes (to sell) | MongoDB Atlas connection string |
| `MONGODB_DB` | no | Database name, default `mrimperial` |
| `AUTH_SECRET` | yes (for admin) | ≥ 32 random chars — `openssl rand -base64 48`. Also signs order-recovery tokens |
| `NEXT_PUBLIC_SITE_URL` | yes in prod | Canonical origin (metadata, sitemap, admin origin check) |
| `NEXT_PUBLIC_GTM_ID` | no | Google Tag Manager container ID (for example `GTM-ABC1234`); tracking is disabled when unset |
| `IMAGE_HOSTS` | if using a CDN | Comma-separated hostnames for `next/image` (`res.cloudinary.com` is allowed by default) |
| `IP_HASH_SALT` | recommended | Salt for hashed IPs used in rate limiting |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | once | Only read by `npm run admin:create`; remove the password afterwards |

All secrets are server-only; only `NEXT_PUBLIC_*` values reach the browser.

### Google Tag Manager events

Set `NEXT_PUBLIC_GTM_ID` in the deployment environment to enable GTM on the public storefront. The data layer emits `page_view`, `view_item`, `section_view` (once per visible page section), `select_item`, `begin_checkout`, `generate_lead`, `contact`, and `purchase`. Ecommerce events use GA4 item parameters; `purchase` fires after the server accepts an order and uses its confirmed items and totals. Customer contact and delivery details are never sent to the data layer. Create matching Custom Event triggers/tags in the GTM container and disable automatic page views in the GA4 config tag to avoid duplicate page views; no tags load when the ID is unset.

---

## What the owner must supply before launch

The site deliberately **does not invent** anything. Until you provide these, the
related UI is hidden or marked as a placeholder:

1. **Real watch photography** — upload to Cloudinary/S3 (or similar) and paste
   the https URLs in **Admin → Product** (product images and per-variant images).
   The bundled `/public/placeholder/*.svg` illustrations are labelled
   "Placeholder image" on the page.
2. **Product data** — title, description, verified specifications (blank fields
   are hidden), variants with SKU / price / stock. Untick **"Preview / demo
   content"** when done; this removes the preview banner and allows indexing
   and Product structured data.
3. **Phone and WhatsApp numbers** (Admin → Store settings). Call/WhatsApp buttons
   only appear once set.
4. **Delivery zones and fees** — the seeded "Inside/Outside Dhaka ৳80/৳150" are
   *preview values*. Orders are refused if no active zone exists.
5. **Policies** — delivery, returns, warranty, privacy (shown in the footer when filled).
6. **Trust highlights / Why us / testimonials** — only verified claims;
   testimonials must be ticked "approved" to appear.
7. **Logo** (optional — a typographic wordmark is used otherwise).
8. **3D model** (optional) — a `.glb/.gltf` of *this exact watch*. Without one,
   the "3D preview" shows an illustrative model labelled "not the actual
   product"; you can switch that off in settings.
9. **Domain + MongoDB Atlas** — set the env vars on your host (e.g. Vercel).

## Payments

Cash on delivery is implemented end-to-end. **Online payment is intentionally
not enabled**: the settings schema rejects `onlinePaymentEnabled: true` and the
order API refuses `paymentMethod: "online"`. To add a gateway (e.g. SSLCommerz,
bKash):

1. Add `POST /api/payments/init` that creates the order as `paymentStatus: "pending"`
   and returns the gateway URL.
2. Add the gateway's IPN/webhook route that **verifies the transaction server-side
   with the gateway** (amount + order number), then sets `paymentStatus: "paid"`.
   Never trust the browser redirect.
3. Allow `onlinePaymentEnabled` in `src/lib/validation/admin.ts` and the
   `online` branch in `src/lib/orders/service.ts`.

---

## How it works

### Rendering & revalidation
- `src/lib/storefront.ts` — `getStorefront()` uses `"use cache"` +
  `cacheTag("storefront")` + `cacheLife("max")`, so `/` is a static page.
- Admin saves call `revalidateTag("storefront", { expire: 0 })` (owner sees the
  change on the next load); orders call `revalidateTag("storefront", "max")`
  (stale-while-revalidate for displayed stock — the server enforces real stock).
- If the DB is unreachable during a build, preview content is cached for minutes only.
- Admin pages read the session inside `<Suspense>` (required by Cache
  Components) and are `private, no-store`, `noindex`.

### Orders — what the server guarantees (`src/lib/orders/service.ts`)
- The request carries **no prices**; unit price, delivery fee, discount and total
  are computed from live DB data (`src/lib/pricing.ts`).
- **No overselling:** stock is reserved with one atomic conditional update
  (`stock >= qty` **and** price unchanged); concurrent orders can't both win.
- **Idempotency:** each form attempt sends a random key (unique index). Retries
  and double-taps return the original order; losing duplicates release their
  stock.
- Cancel/return restores stock exactly once; status transitions are validated.
- Order numbers are server-generated (`MRI-YYMMDD-XXXXX`).
- **Refresh recovery:** the confirmation stores the order number + a secret
  token in `sessionStorage`; `/api/orders/lookup` requires both (only a hash is
  stored).
- Spam/abuse: Zod validation, honeypot, minimum fill time, and MongoDB-backed
  rate limits on orders, leads, lookup and login (falls back to in-memory).
- UTM parameters and referrer (origin + path only) are captured per session.

### Admin security
- No public registration; accounts come from `npm run admin:create`.
- bcrypt (cost 12), generic login errors with timing equalisation, account lock
  after 5 failures, rate-limited login.
- HS256 JWT in an `httpOnly`, `SameSite=Strict`, `Secure` (prod) cookie;
  every page and API re-checks the user in the DB, including `sessionVersion`
  (password reset revokes sessions). `src/proxy.ts` is only an early redirect.
- Mutating admin APIs require a same-origin `Origin` header (CSRF).
- Settings and lead export are owner-only; CSV export neutralises formula injection.

### Motion & 3D (progressive enhancement)
- Content is fully visible without JavaScript. GSAP/ScrollTrigger load after
  idle; reveals only arm once loaded. Lenis runs only on desktop fine-pointer
  devices, is driven by the GSAP ticker, and is destroyed on unmount.
- `prefers-reduced-motion`: no GSAP, no Lenis, no auto-rotate.
- The 3D viewer (`WatchViewer.tsx`) is loaded only when the visitor presses
  "3D preview"; it checks WebGL, handles context loss and load errors, and falls
  back to photos. It never covers purchase controls.

## Project structure

```
src/
  app/
    page.tsx                  # the single public page (+ JSON-LD, metadata)
    layout.tsx, globals.css   # fonts + design tokens (edit colours here)
    api/                      # product, orders, orders/lookup, leads, admin/*
    admin/                    # login + (dashboard) pages
    robots.ts, sitemap.ts, opengraph-image.tsx, icon.svg
  components/
    sections/                 # Header, Hero, PurchaseActions, TrustHighlights, Specifications,
                              # VariantSelector, OrderSection, WhyChoose, FinalCta, Footer
    storefront/               # provider, gallery, 3D viewer, order form/success, sticky bar…
    admin/                    # shell, editors, list editor, order actions, lead row
    motion/                   # GSAP + Lenis provider, scroll/focus helper
    ui/                       # Button, Icon
  lib/
    models/                   # Product, Order, Lead, AdminUser, SiteSettings, RateLimit
    validation/               # Zod schemas (order/lead shared client+server; admin)
    orders/service.ts         # order creation, lookup, status changes
    auth/                     # token, session (DAL), guard, password
    storefront*.ts, pricing.ts, phone.ts, rate-limit.ts, revalidate.ts, demo-data.ts
proxy.ts                      # (in src/) optimistic /admin redirect
scripts/                      # seed.ts, create-admin.ts
tests/                        # Vitest: pricing, phone, validation, auth/guard, orders (in-memory Mongo), rate limit
```

## Design tokens

Colours live in `src/app/globals.css` (`--ivory`, `--porcelain`, `--ink`,
`--champagne`, …). Fonts: Cormorant Garamond (display) and Manrope (body), set
in `src/app/layout.tsx`.
