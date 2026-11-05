import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { FinalCta } from "@/components/sections/FinalCta";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { OrderSection } from "@/components/sections/OrderSection";
import { PurchaseActions } from "@/components/sections/PurchaseActions";
import { Specifications } from "@/components/sections/Specifications";
import { TrustHighlights } from "@/components/sections/TrustHighlights";
import { VariantSelector } from "@/components/sections/VariantSelector";
import { WhyChoose } from "@/components/sections/WhyChoose";
import { EnquiryForm } from "@/components/storefront/EnquiryForm";
import { StickyBar } from "@/components/storefront/StickyBar";
import { StorefrontProvider } from "@/components/storefront/StorefrontProvider";
import { siteUrl } from "@/lib/env";
import { getStorefront } from "@/lib/storefront";
import type { PublicProduct, PublicSettings } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const { product, settings } = await getStorefront();
  const title = product?.seo.title || (product ? `${product.title} — ${settings.brandName}` : settings.brandName);
  const description =
    product?.seo.description || product?.tagline || settings.hero.subheadline || `${settings.brandName} watches.`;
  const og = product?.seo.ogImage;
  return {
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: "/",
      siteName: settings.brandName,
      title,
      description,
      ...(og ? { images: [{ url: og }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
    robots: product?.isDemo ? { index: false, follow: false } : undefined,
  };
}

async function copyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

function ProductJsonLd({ product, settings }: { product: PublicProduct; settings: PublicSettings }) {
  // Only real product data; never emitted for preview/demo content.
  if (product.isDemo) return null;
  const base = siteUrl();
  const abs = (u: string) => (u.startsWith("http") ? u : `${base}${u}`);
  const realImages = product.images.filter((i) => !i.placeholder).map((i) => abs(i.url));
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || product.tagline,
    sku: product.sku,
    ...(product.specs.brand ? { brand: { "@type": "Brand", name: product.specs.brand } } : {}),
    ...(realImages.length ? { image: realImages } : {}),
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      sku: v.sku,
      name: v.name,
      price: v.price,
      priceCurrency: settings.currency.code,
      availability: v.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${base}/`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

function PreviewNotice() {
  return (
    <div className="bg-ink px-4 py-2 text-center text-[0.72rem] leading-relaxed tracking-wide text-porcelain/85">
      Preview content — the product, images, prices and delivery fees shown are placeholders until the store owner
      publishes real details.
    </div>
  );
}

export default async function Home() {
  const [{ product, settings, connected }, year] = await Promise.all([getStorefront(), copyrightYear()]);

  if (!product || product.variants.length === 0) {
    return (
      <>
        <Header brandName={settings.brandName} logoUrl={settings.logoUrl} announcement={settings.announcement} />
        <main id="main" className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-6 text-center">
          <div>
            <p className="label text-champagne-ink">{settings.brandName}</p>
            <h1 className="display mt-6 text-6xl text-ink">A new piece is on its way.</h1>
            <p className="mt-6 text-graphite">Our next watch is being prepared. Please check back soon.</p>
          </div>
        </main>
        <Footer settings={settings} year={year} />
      </>
    );
  }

  return (
    <StorefrontProvider product={product} settings={settings} connected={connected}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-ink focus:px-4 focus:py-3 focus:text-porcelain"
      >
        Skip to content
      </a>
      {product.isDemo || !connected ? <PreviewNotice /> : null}
      <Header brandName={settings.brandName} logoUrl={settings.logoUrl} announcement={settings.announcement} />
      <main id="main">
        <Hero />
        <PurchaseActions />
        <TrustHighlights items={settings.trustHighlights} />
        <Specifications product={product} />
        <VariantSelector />
        <OrderSection />
        <WhyChoose brandName={settings.brandName} items={settings.whyChoose} testimonials={settings.testimonials} />
        <FinalCta title={product.title} image={product.images[0]} />
      </main>
      <Footer settings={settings} year={year} enquiry={<EnquiryForm />} />
      <StickyBar />
      <MotionProvider />
      <ProductJsonLd product={product} settings={settings} />
    </StorefrontProvider>
  );
}
