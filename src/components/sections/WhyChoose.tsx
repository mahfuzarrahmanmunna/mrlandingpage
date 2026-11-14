import { Icon } from "@/components/ui/Icon";
import { langOf } from "@/lib/lang";
import type { Highlight, Testimonial } from "@/lib/types";

/** Section 7 — approved benefits and approved testimonials only. Hidden when both are empty. */
export function WhyChoose({ brandName, items, testimonials }: { brandName: string; items: Highlight[]; testimonials: Testimonial[] }) {
  if (!items.length && !testimonials.length) return null;
  return (
    <section id="why" aria-labelledby="why-title" className="relative overflow-hidden bg-ivory">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <p className="eyebrow" data-reveal>
                কেন আমরা
              </p>
              <h2 id="why-title" className="h-section mt-4 text-ink" data-reveal>
                কেন <span className="accent">{brandName}</span> থেকে কিনবেন?
              </h2>
            </div>
          </div>
          {items.length ? (
            <ol className="border-t border-rule lg:col-span-8">
              {items.map((item, i) => (
                <li
                  key={item.title}
                  data-reveal
                  className="grid grid-cols-[2.75rem_1fr] items-start gap-4 border-b border-rule py-6 sm:grid-cols-[4rem_1fr_auto] sm:gap-6 sm:py-8"
                >
                  <span className="num font-serif text-3xl font-bold leading-none text-champagne-ink sm:text-4xl" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 lang={langOf(item.title)} className="text-lg font-bold text-ink sm:text-xl">{item.title}</h3>
                    {item.text ? <p lang={langOf(item.text)} className="mt-1.5 max-w-xl leading-relaxed text-graphite">{item.text}</p> : null}
                  </div>
                  <span className="hidden size-12 place-items-center rounded-full border border-rule text-champagne-ink sm:grid">
                    <Icon name={item.icon} size={20} />
                  </span>
                </li>
              ))}
            </ol>
          ) : null}
        </div>

        {testimonials.length ? (
          <div className="mt-16 lg:mt-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">গ্রাহকদের মতামত</p>
                <p className="h-section mt-4 text-ink">যারা ইতিমধ্যে কিনেছেন</p>
              </div>
            </div>
            <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <li key={`${t.name}-${t.text.slice(0, 12)}`} data-reveal className="panel flex flex-col p-6 sm:p-7">
                  <blockquote className="flex flex-1 flex-col">
                    <p className="tracking-[0.2em] text-champagne" aria-hidden>
                      ★★★★★
                    </p>
                    <p lang={langOf(t.text)} className="mt-3 flex-1 text-[1.05rem] leading-relaxed text-ink">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <footer className="mt-5 flex items-center gap-3 border-t border-rule-soft pt-4">
                      <span aria-hidden className="grid size-10 place-items-center rounded-full bg-ink text-sm font-bold text-champagne-light">
                        {t.name.trim().charAt(0)}
                      </span>
                      <span className="text-sm">
                        <span className="block font-semibold text-ink">{t.name}</span>
                        {t.location ? <span className="text-mist">{t.location}</span> : null}
                      </span>
                    </footer>
                  </blockquote>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
