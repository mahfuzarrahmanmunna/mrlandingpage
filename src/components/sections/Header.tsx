"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const NAV = [
  { href: "#top", label: "The watch" },
  { href: "#details", label: "Details" },
  { href: "#editions", label: "Editions" },
  { href: "#why", label: "Why us" },
  { href: "#contact", label: "Contact" },
];

export function Wordmark({ brandName, logoUrl }: { brandName: string; logoUrl?: string }) {
  if (logoUrl) {
    return (
      <Image src={logoUrl} alt={brandName} width={160} height={40} className="h-8 w-auto" unoptimized={logoUrl.endsWith(".svg")} />
    );
  }
  const [first, ...rest] = brandName.split(" ");
  return (
    <span className="flex items-baseline gap-1.5 font-serif text-[1.05rem] leading-none tracking-[0.14em] text-ink uppercase sm:gap-2 sm:text-[1.35rem] sm:tracking-[0.18em]">
      <span>{first}</span>
      {rest.length ? <span className="text-champagne-ink">{rest.join(" ")}</span> : null}
    </span>
  );
}

export function Header({ brandName, logoUrl, announcement }: { brandName: string; logoUrl?: string; announcement?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {announcement ? (
        <div className="border-b border-rule-soft bg-linen/70 px-4 py-2 text-center text-[0.72rem] tracking-[0.12em] text-graphite">
          {announcement}
        </div>
      ) : null}
      <header
        className={`sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled || open ? "border-b border-rule-soft bg-ivory/88 backdrop-blur-md" : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[var(--header-h)] w-full max-w-[1360px] items-center justify-between gap-3 px-4 sm:gap-6  sm:px-8 lg:px-12">
          <a href="#top" className="flex min-h-11 items-center" aria-label={`${brandName} — back to top`}>
            <Wordmark brandName={brandName} logoUrl={logoUrl} />
          </a>

          <nav aria-label="Page sections" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {NAV.slice(1).map((n) => (
                <li key={n.href}>
                  <a
                    href={n.href}
                    className="label relative inline-flex min-h-11 items-center text-graphite transition-colors after:absolute after:inset-x-0 after:bottom-2.5 after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-500 hover:text-ink hover:after:scale-x-100"
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <a href="#order" className={buttonClass("primary", "sm", "px-3.5 sm:px-5")}>
              Order now
            </a>
            <button
              type="button"
              className="grid size-11 place-items-center text-ink lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? (
                <Icon name="close" />
              ) : (
                <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M4 8h16M4 16h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <nav
          id="mobile-nav"
          aria-label="Page sections"
          className={`overflow-hidden border-t border-rule-soft bg-ivory transition-[max-height,opacity] duration-500 lg:hidden ${
            open ? "max-h-96 opacity-100" : "pointer-events-none max-h-0 opacity-0"
          }`}
          inert={!open}
        >
          <ul className="mx-auto max-w-[1360px] px-5 py-3 sm:px-8">
            {NAV.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center justify-between border-b border-rule-soft font-serif text-2xl text-ink last:border-0"
                >
                  {n.label}
                  <Icon name="arrow-right" size={18} className="text-mist" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </>
  );
}
