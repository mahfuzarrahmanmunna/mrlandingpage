"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/product", label: "Product" },
  { href: "/admin/settings", label: "Store settings" },
];

function NavLinks({ pathname }: { pathname: string | null }) {
  const isActive = (href: string) =>
    pathname !== null && (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  return (
    <ul className="flex gap-1 lg:flex-col">
      {NAV.map((n) => (
        <li key={n.href}>
          <Link
            href={n.href}
            aria-current={isActive(n.href) ? "page" : undefined}
            className={`flex min-h-10 items-center whitespace-nowrap rounded-[var(--radius-sm)] px-3 text-sm transition ${
              isActive(n.href) ? "bg-ink text-porcelain" : "text-graphite hover:bg-linen hover:text-ink"
            }`}
          >
            {n.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Reads the URL, so it lives behind its own Suspense boundary (required on dynamic routes). */
function ActiveNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-ivory lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-rule bg-porcelain lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block lg:px-6 lg:py-8">
          <Link href="/admin" className="font-serif text-xl tracking-[0.16em] text-ink uppercase">
            MR <span className="text-champagne-ink">Imperial</span>
          </Link>
          <p className="label mt-1 hidden text-mist lg:block">Dashboard</p>
          <button onClick={logout} disabled={busy} className="label text-graphite hover:text-ink lg:hidden">
            Sign out
          </button>
        </div>
        <nav aria-label="Admin" className="overflow-x-auto px-3 pb-3 lg:px-3">
          <Suspense fallback={<NavLinks pathname={null} />}>
            <ActiveNavLinks />
          </Suspense>
        </nav>
        <div className="hidden px-6 lg:absolute lg:bottom-6 lg:block">
          <a href="/" target="_blank" className="block text-sm text-graphite hover:text-ink">
            View storefront ↗
          </a>
          <button onClick={logout} disabled={busy} className="mt-3 text-sm text-graphite hover:text-ink">
            Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</main>
    </div>
  );
}
