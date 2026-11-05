import { Icon } from "@/components/ui/Icon";
import type { Highlight, Testimonial } from "@/lib/types";

/** Section 7 — approved benefits and approved testimonials only. Hidden when both are empty. */
export function WhyChoose({ brandName, items, testimonials }: { brandName: string; items: Highlight[]; testimonials: Testimonial[] }) {
  if (!items.length && !testimonials.length) return null;
  return (
    <section id="why" aria-labelledby="why-title" className="relative overflow-hidden border-t border-rule bg-porcelain">
      <div className="mx-auto w-full max-w-[1360px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="label text-champagne-ink" data-reveal>
              Why {brandName}
            </p>
            <h2 id="why-title" className="display mt-5 text-[clamp(2.5rem,5.5vw,4.25rem)] text-ink" data-reveal>
              Quietly
              <br />
              <span className="italic text-graphite">dependable.</span>
            </h2>
          </div>
          {items.length ? (
            <ol className="lg:col-span-8">
              {items.map((item, i) => (
                <li
                  key={item.title}
                  data-reveal
                  className="grid grid-cols-[3rem_1fr] gap-4 border-t border-rule py-8 first:border-ink/80 sm:grid-cols-[5rem_1fr_auto] sm:gap-8"
                >
                  <span className="num font-serif text-3xl text-champagne-ink sm:text-4xl">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-serif text-2xl text-ink sm:text-3xl">{item.title}</h3>
                    {item.text ? <p className="mt-2 max-w-xl leading-relaxed text-graphite">{item.text}</p> : null}
                  </div>
                  <span className="hidden size-12 place-items-center rounded-full border border-rule text-graphite sm:grid">
                    <Icon name={item.icon} size={20} />
                  </span>
                </li>
              ))}
            </ol>
          ) : null}
        </div>

        {testimonials.length ? (
          <div className="mt-20">
            <p className="label text-mist">From our customers</p>
            <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <li key={`${t.name}-${t.text.slice(0, 12)}`} data-reveal className="border border-rule bg-ivory p-7">
                  <blockquote>
                    <p className="font-serif text-xl leading-snug text-ink">&ldquo;{t.text}&rdquo;</p>
                    <footer className="label mt-5 text-mist">
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
