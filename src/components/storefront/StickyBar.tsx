"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { goToOrder } from "@/components/motion/scroll";
import { formatMoney } from "@/lib/format";
import { useStorefront } from "./StorefrontProvider";

/**
 * Compact mobile purchase bar. Appears after the hero CTA scrolls away and
 * hides while the order form or footer is on screen, so it never covers fields.
 */
export function StickyBar() {
  const { product, variant, unitPrice, settings } = useStorefront();
  const [heroGone, setHeroGone] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero-cta");
    const blockers = ["order", "site-footer"].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const visible = new Set<Element>();

    const heroObs = hero
      ? new IntersectionObserver(([e]) => setHeroGone(!e!.isIntersecting && e!.boundingClientRect.top < 0))
      : null;
    if (hero) heroObs!.observe(hero);

    const blockObs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      setBlocked(visible.size > 0);
    });
    blockers.forEach((b) => blockObs.observe(b));

    return () => {
      heroObs?.disconnect();
      blockObs.disconnect();
    };
  }, []);

  const show = heroGone && !blocked;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-white/95 shadow-[0_-8px_24px_-12px_rgba(21,19,15,0.18)] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md transition-transform duration-500 ease-out lg:hidden ${
        show ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
      aria-hidden={!show}
      inert={!show}
    >
      <div lang="bn" className="mx-auto flex max-w-xl items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.8rem] text-graphite">
            {product.title} · {variant.name}
          </p>
          <p className="num text-xl font-extrabold leading-tight text-ink">{formatMoney(unitPrice, settings.currency)}</p>
        </div>
        <Button onClick={goToOrder} disabled={variant.stock < 1} size="md" className="px-7 text-base">
          {variant.stock < 1 ? "স্টক শেষ" : "অর্ডার করুন"}
        </Button>
      </div>
    </div>
  );
}
