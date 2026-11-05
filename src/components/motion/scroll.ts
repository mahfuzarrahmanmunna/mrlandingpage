"use client";

type LenisLike = { scrollTo: (target: Element | number, opts?: { offset?: number; duration?: number; immediate?: boolean; onComplete?: () => void }) => void };

declare global {
  interface Window {
    __mriLenis?: LenisLike | null;
  }
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function headerOffset() {
  const h = getComputedStyle(document.documentElement).getPropertyValue("--header-h");
  return -(parseInt(h, 10) || 64) - 12;
}

/**
 * Scrolls to a section and (optionally) moves keyboard focus into it.
 * Works with or without Lenis, and instantly when reduced motion is preferred.
 */
export function scrollToId(id: string, opts: { focusSelector?: string } = {}) {
  const el = document.getElementById(id);
  if (!el) return;

  const focus = () => {
    const target = (opts.focusSelector ? el.querySelector<HTMLElement>(opts.focusSelector) : null) ?? el;
    if (target === el && !el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };

  const reduce = prefersReducedMotion();
  const lenis = window.__mriLenis;
  if (lenis && !reduce) {
    lenis.scrollTo(el, { offset: headerOffset(), duration: 1.1, onComplete: focus });
  } else {
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    window.setTimeout(focus, reduce ? 0 : 450);
  }
  if (history.replaceState) history.replaceState(null, "", `#${id}`);
}

export function goToOrder() {
  scrollToId("order", { focusSelector: "input[name='name'], [data-order-focus]" });
}
