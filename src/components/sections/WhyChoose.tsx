import { Icon } from "@/components/ui/Icon";
import { langOf } from "@/lib/lang";
import type { Highlight, Testimonial } from "@/lib/types";

/** Section 7 — approved benefits and approved testimonials only. Hidden when both are empty. */
export function WhyChoose({ brandName, items, testimonials }: { brandName: string; items: Highlight[]; testimonials: Testimonial[] }) {
  if (!items.length && !testimonials.length) return null;
  return (
    <section id="why" aria-labelledby="why-title" className="relative overflow-hidden bg-linen">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="eyebrow" data-reveal>
              কেন আমরা
            </p>
            <h2 id="why-title" className="display mt-4 text-[clamp(1.75rem,4.5vw,2.75rem)] text-ink" data-reveal>
              কেন <span className="text-champagne-ink">{brandName}</span> থেকে কিনবেন?
            </h2>
          </div>
          {items.length ? (
            <ol className="grid gap-3 lg:col-span-8">
              {items.map((item, i) => (
                <li
                  key={item.title}
                  data-reveal
                  className="grid grid-cols-[3rem_1fr] items-start gap-4 rounded-[var(--radius-md)] bg-white p-5 shadow-soft sm:grid-cols-[3.5rem_1fr] sm:p-6"
                >
                  <span className="grid size-12 place-items-center rounded-full bg-champagne-soft text-champagne-ink" aria-label={String(i + 1)}>
                    <Icon name={item.icon} size={22} />
                  </span>
                  <div>
                    <h3 lang={langOf(item.title)} className="text-lg font-bold text-ink sm:text-xl">{item.title}</h3>
                    {item.text ? <p lang={langOf(item.text)} className="mt-1.5 max-w-xl leading-relaxed text-graphite">{item.text}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          ) : null}
        </div>

        {testimonials.length ? (
          <div className="mt-14">
            <p className="text-xl font-bold text-ink">গ্রাহকদের মতামত</p>
            <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <li key={`${t.name}-${t.text.slice(0, 12)}`} data-reveal className="rounded-[var(--radius-md)] bg-white p-6 shadow-soft">
                  <blockquote>
                    <p className="text-offer" aria-hidden>★★★★★</p>
                    <p lang={langOf(t.text)} className="mt-2 text-lg leading-relaxed text-ink">&ldquo;{t.text}&rdquo;</p>
                    <footer className="mt-4 text-sm font-semibold text-mist">
                      {t.name}
                      {t.location ? ` · ${t.location}` : ""}
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
