"use client";

import { useEffect } from "react";
import { scrollToId } from "./scroll";

/**
 * Progressive motion layer.
 *  - Content is fully visible without JS; reveal states only apply once
 *    `html.motion-ready` is set here.
 *  - GSAP, ScrollTrigger and Lenis are dynamically imported after idle.
 *  - Lenis runs only on fine-pointer devices (native scrolling on touch),
 *    is driven by the GSAP ticker, and is torn down on unmount.
 *  - Nothing runs when prefers-reduced-motion is set.
 */
export function MotionProvider() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;
    const root = document.documentElement;

    const start = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);

      const finePointer = window.matchMedia("(pointer: fine) and (min-width: 1024px)").matches;
      let lenis: import("lenis").default | null = null;
      let tick: ((time: number) => void) | null = null;

      if (finePointer) {
        const { default: Lenis } = await import("lenis");
        if (disposed) return;
        lenis = new Lenis({ lerp: 0.11, smoothWheel: true, anchors: false, autoRaf: false });
        lenis.on("scroll", ScrollTrigger.update);
        tick = (time: number) => lenis!.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
        window.__mriLenis = lenis;
      }

      // Anchor links (#order etc.) go through one helper so Lenis/focus work together.
      const onClick = (e: MouseEvent) => {
        const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href^='#']");
        if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.button !== 0) return;
        const id = a.getAttribute("href")!.slice(1);
        if (!id || !document.getElementById(id)) return;
        e.preventDefault();
        scrollToId(id, id === "order" ? { focusSelector: "input[name='name'], [data-order-focus]" } : {});
      };
      document.addEventListener("click", onClick);

      root.classList.add("motion-ready");

      const ctx = gsap.context(() => {
        // Editorial reveals
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          const delay = Number(el.dataset.revealDelay ?? 0);
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 1.1,
            delay,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });

        // Hero dial ring: slow rotation tied to scroll (transform only)
        gsap.utils.toArray<HTMLElement>("[data-parallax-rotate]").forEach((el) => {
          gsap.to(el, {
            rotate: Number(el.dataset.parallaxRotate ?? 30),
            ease: "none",
            scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.6 },
          });
        });

        // Gentle image drift for editorial crops
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const amount = Number(el.dataset.parallax ?? 40);
          gsap.fromTo(
            el,
            { yPercent: -amount / 10 },
            {
              yPercent: amount / 10,
              ease: "none",
              scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });
      });

      // Ensure everything is visible if the user switches reduced motion on mid-session.
      const onReduceChange = () => {
        if (reduce.matches) cleanup?.();
      };
      reduce.addEventListener("change", onReduceChange);

      cleanup = () => {
        ctx.revert();
        document.removeEventListener("click", onClick);
        reduce.removeEventListener("change", onReduceChange);
        if (tick) gsap.ticker.remove(tick);
        lenis?.destroy();
        window.__mriLenis = null;
        root.classList.remove("motion-ready");
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
      if (disposed) cleanup();
    };

    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = hasIdle
      ? window.requestIdleCallback(() => void start(), { timeout: 1200 })
      : globalThis.setTimeout(() => void start(), 300);

    return () => {
      disposed = true;
      if (hasIdle) window.cancelIdleCallback(idle as number);
      else globalThis.clearTimeout(idle as ReturnType<typeof setTimeout>);
      cleanup?.();
    };
  }, []);

  return null;
}
