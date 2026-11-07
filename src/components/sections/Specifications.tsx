import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { langOf } from "@/lib/lang";
import type { IconName, ProductSpecs, PublicProduct } from "@/lib/types";

type Feature = { icon: IconName; title: string; text: string };

/** Short display value: first fragment, without seller caveats ("প্রায় 40 mm" → "40 mm"). */
function clean(value: string | undefined) {
  const first = value?.split(/\s[—(;]/)[0]?.replace(/[ঀ-৿]+/g, "").replace(/\s+/g, " ").trim();
  return first || undefined;
}

function features(s: ProductSpecs): Feature[] {
  const list: (Feature | null)[] = [
    s.movement
      ? {
          icon: "clock",
          title: `${clean(s.movement)} movement`,
          text: s.powerSource ? `${clean(s.powerSource)} powered for accurate, low-maintenance timekeeping.` : "Accurate, low-maintenance timekeeping.",
        }
      : null,
    s.dialSize
      ? {
          icon: "seal",
          title: `${clean(s.dialSize)} ${clean(s.caseShape)?.toLowerCase() ?? ""} case`.replace(/\s+/g, " "),
          text: s.caseThickness ? `Slim ${clean(s.caseThickness)} profile that sits comfortably under a shirt cuff.` : "A balanced size for most wrists.",
        }
      : null,
    s.strapMaterial
      ? {
          icon: "spark",
          title: `${clean(s.strapMaterial)} bracelet`,
          text: `Adjustable links${s.clasp ? ` with a ${clean(s.clasp)?.toLowerCase()}` : ""}.`,
        }
      : null,
    s.calendar
      ? { icon: "clock", title: `${clean(s.calendar)} display`, text: "See the day and date at a glance." }
      : null,
    s.luminous ? { icon: "spark", title: "Luminous hands", text: "Easy to read in low light and at night." } : null,
    s.glass
      ? {
          icon: "shield",
          title: /glass|crystal/i.test(clean(s.glass) ?? "") ? clean(s.glass)! : `${clean(s.glass)} glass`,
          text: "Toughened for better scratch resistance than ordinary glass.",
        }
      : null,
    s.waterResistance
      ? {
          icon: "shield",
          title: `${clean(s.waterResistance)} splash resistant`,
          text: "Fine for sweat, light rain and splashes. Not for bathing or swimming.",
        }
      : null,
  ];
  return list.filter(Boolean) as Feature[];
}

/** First paragraph of the description, plus an optional "Perfect for" list. */
function intro(description: string) {
  const paragraphs = description.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const perfect = paragraphs.find((p) => /^perfect for/i.test(p));
  const uses = perfect
    ?.split("\n")
    .slice(1)
    .map((l) => l.replace(/^[•\-\s]+/, "").trim())
    .filter(Boolean);
  return { lead: paragraphs[0], uses: uses ?? [] };
}

/** Section 4 — key features (the full specification list is kept in structured data for search). */
export function Specifications({ product }: { product: PublicProduct }) {
  const items = features(product.specs);
  const { lead, uses } = intro(product.description || "");
  if (!items.length && !lead) return null;
  const detailImage = product.images[2] ?? product.images[1] ?? product.images[0];

  return (
    <section id="details" aria-labelledby="details-title" className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 md:px-8 lg:px-10 lg:py-28">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="label text-champagne-ink" data-reveal>
            Features
          </p>
          <h2 id="details-title" className="display mt-4 text-[clamp(2.25rem,5vw,4rem)] text-ink" data-reveal>
            Made for <span className="italic text-graphite">every day.</span>
          </h2>
          {lead ? (
            <p lang={langOf(lead)} className="mt-6 max-w-md leading-relaxed text-graphite" data-reveal>
              {lead}
            </p>
          ) : null}
          {uses.length ? (
            <div className="mt-6" data-reveal>
              <p className="text-sm font-semibold text-ink">Perfect for</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {uses.map((u) => (
                  <li key={u} lang={langOf(u)} className="rounded-full border border-rule bg-porcelain px-3.5 py-1.5 text-sm text-graphite">
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {detailImage ? (
            <div className="relative mt-10 hidden aspect-[4/5] max-w-sm overflow-hidden rounded-[var(--radius-md)] ring-1 ring-rule-soft lg:block">
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
            </div>
          ) : null}
        </div>

        {items.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:col-span-7 lg:pt-2">
            {items.map((f, i) => (
              <li
                key={f.title}
                data-reveal
                data-reveal-delay={Math.min(i * 0.05, 0.3)}
                className={`flex gap-4 rounded-[var(--radius-md)] bg-porcelain p-5 ring-1 ring-rule-soft sm:flex-col sm:gap-3 sm:p-6 ${
                  items.length % 2 === 1 && i === items.length - 1 ? "sm:col-span-2 sm:flex-row sm:items-center sm:gap-5" : ""
                }`}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-champagne/15 text-champagne-ink">
                  <Icon name={f.icon} size={20} />
                </span>
                <div>
                  <h3 className="font-serif text-xl leading-tight text-ink sm:text-2xl">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-graphite">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
