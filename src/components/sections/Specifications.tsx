import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { bn } from "@/lib/format";
import type { IconName, ProductSpecs, PublicProduct } from "@/lib/types";

type Feature = { icon: IconName; title: string; text: string };

/** First number in a spec value, in Bangla digits ("41.5 mm" or "৪১.৫ মিমি" → "৪১.৫"). */
function size(value: string | undefined) {
  const ascii = value?.replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09e6));
  const n = ascii?.match(/\d+(\.\d+)?/)?.[0];
  return n ? bn(n) : undefined;
}

const has = (value: string | undefined, re: RegExp) => Boolean(value && re.test(value));

/** Plain-Bangla feature cards, built from the product specs (works with English or Bangla spec values). */
function features(s: ProductSpecs): Feature[] {
  const dial = size(s.dialSize);
  const thin = size(s.caseThickness);
  const list: (Feature | false | "" | undefined)[] = [
    s.movement && {
      icon: "clock",
      title: has(s.movement, /quartz|কোয়ার্টজ/i) ? "কোয়ার্টজ মেশিন" : "নির্ভুল মেশিন",
      text: "সময় ঠিক থাকে, কোনো ঝামেলা নেই।",
    },
    s.dialSize && {
      icon: "seal",
      title: dial ? `${dial} মিমি ডায়াল` : "মানানসই ডায়াল",
      text: thin ? `মাত্র ${thin} মিমি পাতলা — শার্টের হাতার নিচে আরামে থাকে।` : "বেশিরভাগ হাতে মানিয়ে যায়।",
    },
    s.strapMaterial && {
      icon: "spark",
      title: has(s.strapMaterial, /steel|স্টিল/i)
        ? "স্টিলের বেল্ট"
        : has(s.strapMaterial, /leather|চামড়া/i)
          ? "চামড়ার বেল্ট"
          : "মজবুত বেল্ট",
      text: "হাতের মাপ অনুযায়ী ছোট-বড় করা যায়।",
    },
    s.calendar && { icon: "clock", title: "বার ও তারিখ দেখায়", text: "এক নজরে আজকের বার ও তারিখ দেখুন।" },
    s.luminous && !has(s.luminous, /^(no|না)/i) && {
      icon: "spark",
      title: "অন্ধকারে জ্বলে",
      text: "রাতেও সহজে সময় দেখা যায়।",
    },
    s.glass && {
      icon: "shield",
      title: has(s.glass, /sapphire|স্যাফায়ার/i) ? "স্যাফায়ার কাচ" : "মজবুত কাচ",
      text: "সাধারণ কাচের চেয়ে সহজে দাগ পড়ে না।",
    },
    s.waterResistance && {
      icon: "shield",
      title: "পানির ছিটায় সমস্যা নেই",
      text: "ঘাম ও হালকা বৃষ্টিতে ভয় নেই। তবে গোসল বা সাঁতারের সময় খুলে রাখুন।",
    },
  ];
  return list.filter(Boolean) as Feature[];
}

/** First paragraph of the description, plus an optional "where it fits" list. */
function intro(description: string) {
  const paragraphs = description.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const perfect = paragraphs.find((p) => /^(perfect for|যেখানে মানানসই)/i.test(p));
  const uses = perfect
    ?.split("\n")
    .slice(1)
    .map((l) => l.replace(/^[•\-\s]+/, "").trim())
    .filter(Boolean);
  return { lead: paragraphs[0], uses: uses ?? [] };
}

/** Key features (the full specification list is kept in structured data for search). */
export function Specifications({ product }: { product: PublicProduct }) {
  const items = features(product.specs);
  const { lead, uses } = intro(product.description || "");
  if (!items.length && !lead) return null;
  const detailImage = product.images[2] ?? product.images[1] ?? product.images[0];

  return (
    <section id="details" aria-labelledby="details-title" className="night-glow on-dark relative isolate overflow-hidden text-white">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-16 sm:px-6 md:px-8 lg:px-10 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="eyebrow" data-reveal>
              বৈশিষ্ট্য
            </p>
            <h2 id="details-title" className="h-section mt-4 text-white" data-reveal>
              কেন এই ঘড়িটি <span className="accent">ভালো?</span>
            </h2>
            {lead ? (
              <p className="mt-6 max-w-md leading-relaxed text-white/70" data-reveal>
                {lead}
              </p>
            ) : null}
            {uses.length ? (
              <div className="mt-7" data-reveal>
                <p className="text-[0.95rem] font-semibold text-white">যেখানে মানানসই</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {uses.map((u) => (
                    <li key={u} className="rounded-full border border-white/15 px-3.5 py-1.5 text-sm text-white/80">
                      {u}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {detailImage ? (
              <div className="relative mt-10 hidden aspect-[4/5] max-w-sm overflow-hidden rounded-[var(--radius-md)] ring-1 ring-white/10 lg:block">
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
            <ul className="grid gap-px self-start overflow-hidden rounded-[var(--radius-md)] border border-white/10 bg-white/10 sm:grid-cols-2 lg:col-span-7">
              {items.map((f, i) => (
                <li
                  key={f.title}
                  data-reveal
                  data-reveal-delay={Math.min(i * 0.05, 0.3)}
                  className={`flex gap-4 bg-night p-5 transition-colors hover:bg-night-soft sm:flex-col sm:gap-4 sm:p-7 ${
                    items.length % 2 === 1 && i === items.length - 1 ? "sm:col-span-2 sm:flex-row sm:items-center sm:gap-5" : ""
                  }`}
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full border border-champagne-light/40 text-champagne-light">
                    <Icon name={f.icon} size={19} />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold leading-tight text-white">{f.title}</h3>
                    <p className="mt-1.5 text-[0.95rem] leading-relaxed text-white/65">{f.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
