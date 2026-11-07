"use client";

import { useEffect, useRef } from "react";
import { analyticsItem, trackEcommerceEvent, trackEvent } from "@/lib/analytics";
import { useStorefront } from "./StorefrontProvider";

export function StorefrontAnalytics() {
  const { product, settings, variant, connected } = useStorefront();
  const viewedItems = useRef(new Set<string>());

  useEffect(() => {
    trackEvent("page_view", {
      page_location: `${window.location.origin}${window.location.pathname}`,
      page_title: document.title,
      page_path: window.location.pathname,
    });

    const sections = document.querySelectorAll<HTMLElement>("main section[id]");
    if (!("IntersectionObserver" in window)) return;

    const viewed = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const section = entry.target as HTMLElement;
          if (!entry.isIntersecting || viewed.has(section.id)) continue;
          viewed.add(section.id);
          const headingId = section.getAttribute("aria-labelledby");
          const heading = headingId ? document.getElementById(headingId)?.textContent?.trim() : undefined;
          trackEvent("section_view", {
            section_id: section.id,
            ...(heading ? { section_name: heading.slice(0, 120) } : {}),
          });
          observer.unobserve(section);
        }
      },
      { threshold: 0.1 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!connected || product.isDemo || viewedItems.current.has(variant.sku)) return;
    viewedItems.current.add(variant.sku);
    trackEcommerceEvent("view_item", {
      currency: settings.currency.code,
      value: variant.price,
      items: [analyticsItem(product, variant)],
    });
  }, [connected, product, settings.currency.code, variant]);

  return null;
}