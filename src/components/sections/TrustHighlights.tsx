import { Icon } from "@/components/ui/Icon";
import type { Highlight } from "@/lib/types";

/** Section 3 — owner-configured, verified selling points only. Hidden when empty. */
export function TrustHighlights({ items }: { items: Highlight[] }) {
  if (!items.length) return null;
  return (
    <section aria-label="Shopping with us" className="mx-auto w-full max-w-[1360px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <ul
        className={`grid gap-px overflow-hidden rounded-[var(--radius-sm)] border border-rule-soft bg-rule-soft sm:grid-cols-2 ${
          items.length >= 4 ? "lg:grid-cols-4" : items.length === 3 ? "lg:grid-cols-3" : ""
        }`}
      >
        {items.map((h, i) => (
          <li key={h.title} data-reveal data-reveal-delay={i * 0.08} className="flex gap-4 bg-ivory p-6 lg:p-8">
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-rule text-champagne-ink">
              <Icon name={h.icon} size={20} />
            </span>
            <div>
              <h3 className="text-[0.95rem] font-semibold text-ink">{h.title}</h3>
              {h.text ? <p className="mt-1.5 text-sm leading-relaxed text-graphite">{h.text}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
