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
          text: "নির্ভুল সময়, ঝামেলাহীন ব্যবহার।",
        }
      : null,
    s.dialSize
      ? {
          icon: "seal",
          title: `${clean(s.dialSize)} ${clean(s.caseShape)?.toLowerCase() ?? ""} case`.replace(/\s+/g, " "),
          text: s.caseThickness ? `মাত্র ${clean(s.caseThickness)} পাতলা — শার্টের হাতার নিচে আরামে থাকে।` : "বেশিরভাগ হাতে মানানসই সাইজ।",
        }
      : null,
    s.strapMaterial
      ? {
          icon: "spark",
          title: `${clean(s.strapMaterial)} bracelet`,
          text: "হাতের মাপ অনুযায়ী অ্যাডজাস্ট করা যায়।",
        }
      : null,
    s.calendar
      ? { icon: "clock", title: `${clean(s.calendar)} display`, text: "এক নজরে বার ও তারিখ দেখুন।" }
      : null,
    s.luminous ? { icon: "spark", title: "Luminous hands", text: "অন্ধকারে ও রাতেও সহজে সময় দেখা যায়।" } : null,
    s.glass
      ? {
          icon: "shield",
          title: /glass|crystal/i.test(clean(s.glass) ?? "") ? clean(s.glass)! : `${clean(s.glass)} glass`,
          text: "সাধারণ কাচের চেয়ে বেশি দাগ-প্রতিরোধী।",
        }
      : null,
    s.waterResistance
      ? {
          icon: "shield",
          title: `${clean(s.waterResistance)} splash resistant`,
          text: "ঘাম, হালকা বৃষ্টি ও পানির ছিটায় সমস্যা নেই। গোসল বা সাঁতারে ব্যবহার করবেন না।",
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
    <section id="details" aria-labelledby="details-title" className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6 md:px-8 lg:px-10 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="eyebrow" data-reveal>
            বৈশিষ্ট্য
          </p>
          <h2 id="details-title" className="display mt-4 text-[clamp(1.75rem,4.5vw,2.75rem)] text-ink" data-reveal>
            কেন এই ঘড়িটি <span className="text-champagne-ink">সেরা?</span>
          </h2>
          {lead ? (
            <p lang={langOf(lead)} className="mt-6 max-w-md leading-relaxed text-graphite" data-reveal>
              {lead}
            </p>
          ) : null}
          {uses.length ? (
            <div className="mt-6" data-reveal>
              <p className="text-[0.95rem] font-bold text-ink">যেখানে মানানসই</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {uses.map((u) => (
                  <li key={u} lang={langOf(u)} className="rounded-full bg-champagne-soft px-3.5 py-1.5 text-sm font-medium text-champagne-ink">
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
                className={`flex gap-4 rounded-[var(--radius-md)] border border-rule bg-white p-5 shadow-soft sm:flex-col sm:gap-3 sm:p-6 ${
                  items.length % 2 === 1 && i === items.length - 1 ? "sm:col-span-2 sm:flex-row sm:items-center sm:gap-5" : ""
                }`}
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-champagne-soft text-champagne-ink">
                  <Icon name={f.icon} size={20} />
                </span>
                <div>
                  <h3 className="text-lg font-bold leading-tight text-ink">{f.title}</h3>
                  <p lang="bn" className="mt-1.5 text-[0.95rem] leading-relaxed text-graphite">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
