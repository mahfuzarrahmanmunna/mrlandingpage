import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { FinalCta } from "@/components/sections/FinalCta";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { OrderSection } from "@/components/sections/OrderSection";
import { Specifications } from "@/components/sections/Specifications";
import { TrustHighlights } from "@/components/sections/TrustHighlights";
import { VariantSelector } from "@/components/sections/VariantSelector";
import { WhyChoose } from "@/components/sections/WhyChoose";
import { EnquiryForm } from "@/components/storefront/EnquiryForm";
import { GoogleTagManager } from "@/components/storefront/GoogleTagManager";
import { StickyBar } from "@/components/storefront/StickyBar";
import { StorefrontAnalytics } from "@/components/storefront/StorefrontAnalytics";
import { StorefrontProvider } from "@/components/storefront/StorefrontProvider";
import { absoluteUrl, jsonLd, keywords, organizationJsonLd, productJsonLd, seoDescription, seoTitle } from "@/lib/seo";
import { getStorefront } from "@/lib/storefront";
import type { PublicProduct, PublicSettings } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const { product, settings } = await getStorefront();
  if (!product) {
    return {
      title: settings.brandName,
      description: settings.hero.subheadline || `${settings.brandName} watches.`,
      alternates: { canonical: "/" },
      robots: { index: false, follow: true },
    };
  }
  const title = seoTitle(product, settings);
  const description = seoDescription(product, settings);
  return {
    title,
    description,
    keywords: keywords(product, settings),
    alternates: { canonical: "/" },
    category: "Watches",
    openGraph: {
      type: "website",
      url: "/",
      siteName: settings.brandName,
      title,
      description,
      locale: settings.currency.code === "BDT" ? "bn_BD" : "en_US",
      alternateLocale: ["en_US"],
      ...(product.videoUrl ? { videos: [{ url: absoluteUrl(product.videoUrl), type: "video/mp4" }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
    // Preview/demo content stays out of search until the owner publishes real data.
    robots: product.isDemo
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  };
}

async function copyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

function StructuredData({ product, settings }: { product: PublicProduct; settings: PublicSettings }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(organizationJsonLd(settings))} />
      {/* Product data only for real listings — never for preview/demo content. */}
      {product.isDemo ? null : (
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(productJsonLd(product, settings))} />
      )}
    </>
  );
}

function PreviewNotice() {
  return (
    <div className="border-b border-white/10 bg-ink px-4 py-2.5 text-center text-xs leading-relaxed tracking-wide text-porcelain/85">
      <span className="mr-2 inline-flex items-center gap-2 font-semibold uppercase tracking-[0.18em] text-champagne-soft">
        <span aria-hidden className="size-1.5 rounded-full bg-champagne" />
        Preview
      </span>
      Supplier photos and specifications are for reference; verify the received batch and set live pricing, stock and delivery details before publishing.
    </div>
  );
}

function CollectionRail({ product, brandName }: { product: PublicProduct; brandName: string }) {
  const reference = product.specs.model || product.sku || product.variants[0]?.sku;

  return (
    <div className="border-y border-rule-soft bg-porcelain/75">
      <div className="mx-auto flex w-full max-w-[1360px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3.5 sm:px-8 lg:px-12">
        <p className="label flex items-center gap-2 text-mist">
          <span aria-hidden className="size-1.5 rounded-full bg-champagne" />
          {brandName}
          <span aria-hidden className="text-rule">/</span>
          Timepieces
        </p>
        <div className="flex items-center gap-5">
          {reference ? (
            <p className="label text-mist">
              Reference <span className="ml-1.5 text-ink">{reference}</span>
            </p>
          ) : null}
          <p className="label hidden text-mist sm:block">
            {String(product.variants.length).padStart(2, "0")} {product.variants.length === 1 ? "edition" : "editions"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  const [{ product, settings, connected }, year] = await Promise.all([getStorefront(), copyrightYear()]);

  if (!product || product.variants.length === 0) {
    return (
      <>
        <GoogleTagManager />
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
      <GoogleTagManager />
      <StorefrontAnalytics />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-ink focus:px-4 focus:py-3 focus:text-porcelain"
      >
        Skip to content
      </a>
      {product.isDemo || !connected ? <PreviewNotice /> : null}
      <Header brandName={settings.brandName} logoUrl={settings.logoUrl} announcement={settings.announcement} />
      <CollectionRail product={product} brandName={settings.brandName} />
      <main id="main" className="bg-ivory">
        <div className="relative isolate overflow-x-clip bg-[radial-gradient(ellipse_at_72%_30%,rgba(217,195,155,0.2),transparent_38%),linear-gradient(180deg,#fbf9f4_0%,#f6f2ea_68%,#eee7da_150%)]">
          <div className="relative z-10">
            <Hero />
          </div>
        </div>
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
      <StructuredData product={product} settings={settings} />
    </StorefrontProvider>
  );
}
