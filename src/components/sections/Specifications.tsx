import Image from "next/image";
import type { PublicProduct, SpecKey } from "@/lib/types";

const LABELS: Record<SpecKey, string> = {
  brand: "Brand",
  model: "Model",
  sku: "Reference / SKU",
  dialSize: "Case diameter",
  caseThickness: "Case thickness",
  caseMaterial: "Case material",
  strapMaterial: "Strap / bracelet",
  movement: "Movement",
  waterResistance: "Water resistance",
  glass: "Crystal",
  dialColor: "Dial",
  color: "Colour",
  warranty: "Warranty",
};

const ORDER: SpecKey[] = [
  "brand",
  "model",
  "sku",
  "dialSize",
  "caseThickness",
  "caseMaterial",
  "strapMaterial",
  "movement",
  "waterResistance",
  "glass",
  "dialColor",
  "color",
  "warranty",
];

/** Section 4 — only fields with a supplied value are rendered. */
export function Specifications({ product }: { product: PublicProduct }) {
  const rows = ORDER.filter((k) => product.specs[k]).map((k) => [LABELS[k], product.specs[k]!] as const);
  if (!rows.length && !product.description) return null;
  const detailImage = product.images[2] ?? product.images[1] ?? product.images[0];

  return (
    <section id="details" aria-labelledby="details-title" className="mx-auto w-full max-w-[1360px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="label text-champagne-ink" data-reveal>
            The details
          </p>
          <h2 id="details-title" className="display mt-5 text-[clamp(2.5rem,6vw,4.75rem)] text-ink" data-reveal>
            Considered,
            <br />
            <span className="italic text-graphite">down to the millimetre.</span>
          </h2>
          {product.description ? (
            <p className="mt-7 max-w-md whitespace-pre-line leading-relaxed text-graphite" data-reveal>
              {product.description}
            </p>
          ) : null}
          {detailImage ? (
            <div className="relative mt-10 hidden aspect-[4/5] max-w-sm overflow-hidden rounded-[var(--radius-sm)] ring-1 ring-rule-soft lg:block">
              <div className="absolute -inset-y-[8%] inset-x-0" data-parallax="40">
                <Image
                  src={detailImage.url}
                  alt={detailImage.alt}
                  fill
                  sizes="384px"
                  loading="lazy"
                  unoptimized={detailImage.url.endsWith(".svg")}
                  className="object-cover"
                />
              </div>
              {detailImage.placeholder ? (
                <span className="label absolute bottom-3 left-3 bg-porcelain/85 px-2 py-1 text-[0.58rem] text-mist">
                  Placeholder image
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {rows.length ? (
          <div className="lg:col-span-7 lg:pt-4">
            <dl className="border-t border-ink/80">
              {rows.map(([label, value], i) => (
                <div
                  key={label}
                  data-reveal
                  data-reveal-delay={Math.min(i * 0.04, 0.3)}
                  className="grid grid-cols-1 gap-1 border-b border-rule py-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-6"
                >
                  <dt className="label text-mist">{label}</dt>
                  <dd className="num break-words font-serif text-xl text-ink sm:text-2xl">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </div>
    </section>
  );
}
