import { Icon } from "@/components/ui/Icon";
import { langOf } from "@/lib/lang";
import type { Highlight } from "@/lib/types";

/** Dividers between cells: 1 column on phones, 2 on tablets, one row on desktop. */
function borders(i: number, n: number) {
  const last = i === n - 1;
  const cls = [];
  if (!last) cls.push("max-sm:border-b");
  if (i % 2 === 0 && !last) cls.push("sm:max-lg:border-r");
  if (i < n - (n % 2 || 2)) cls.push("sm:max-lg:border-b");
  if (!last) cls.push("lg:border-r");
  return cls.join(" ");
}

/** Section 3 — owner-configured, verified selling points only. Hidden when empty. */
export function TrustHighlights({ items }: { items: Highlight[] }) {
  if (!items.length) return null;
  const cols = items.length >= 4 ? "lg:grid-cols-4" : items.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";
  return (
    <section aria-label="আমাদের সেবা" className="border-y border-rule bg-porcelain">
      <ul className={`mx-auto grid w-full max-w-[1240px] grid-cols-1 sm:grid-cols-2 ${cols}`}>
        {items.map((h, i) => (
          <li
            key={h.title}
            data-reveal
            data-reveal-delay={i * 0.08}
            className={`flex items-start gap-4 border-rule-soft px-5 py-6 sm:px-8 sm:py-8 ${borders(i, items.length)}`}
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-full border border-champagne/40 text-champagne-ink">
              <Icon name={h.icon} size={20} />
            </span>
            <div>
              <h3 lang={langOf(h.title)} className="text-base font-bold text-ink">{h.title}</h3>
              {h.text ? <p lang={langOf(h.text)} className="mt-1 text-sm leading-relaxed text-mist">{h.text}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
