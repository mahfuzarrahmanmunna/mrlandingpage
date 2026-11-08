import { Icon } from "@/components/ui/Icon";
import { langOf } from "@/lib/lang";
import type { Highlight } from "@/lib/types";

/** Section 3 — owner-configured, verified selling points only. Hidden when empty. */
export function TrustHighlights({ items }: { items: Highlight[] }) {
  if (!items.length) return null;
  return (
    <section aria-label="আমাদের সেবা" className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-8 lg:px-10 lg:py-14">
      <ul
        className={`grid gap-3 sm:grid-cols-2 ${
          items.length >= 4 ? "lg:grid-cols-4" : items.length === 3 ? "lg:grid-cols-3" : ""
        }`}
      >
        {items.map((h, i) => (
          <li key={h.title} data-reveal data-reveal-delay={i * 0.08} className="flex gap-4 rounded-[var(--radius-md)] border border-rule bg-white p-5 shadow-soft lg:p-6">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-champagne-soft text-champagne-ink">
              <Icon name={h.icon} size={20} />
            </span>
            <div>
              <h3 lang={langOf(h.title)} className="text-base font-bold text-ink">{h.title}</h3>
              {h.text ? <p lang={langOf(h.text)} className="mt-1 text-sm leading-relaxed text-graphite">{h.text}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
