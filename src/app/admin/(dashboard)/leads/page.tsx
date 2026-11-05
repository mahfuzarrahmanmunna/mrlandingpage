import Link from "next/link";
import { Suspense } from "react";
import { AdminSkeleton } from "@/components/admin/AdminSkeleton";
import { LeadRow, type LeadView } from "@/components/admin/LeadRow";
import { PageHeader } from "@/components/admin/ui";
import { buttonClass } from "@/components/ui/Button";
import { listLeads } from "@/lib/admin/queries";
import { requireAdminPage } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import { LEAD_STATUSES } from "@/lib/models/Lead";

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default function LeadsPage({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Leads searchParams={searchParams} />
    </Suspense>
  );
}

async function Leads({ searchParams }: { searchParams: SP }) {
  const admin = await requireAdminPage();
  const sp = await searchParams;
  const status = one(sp.status);
  const page = Math.max(1, parseInt(one(sp.page), 10) || 1);
  const data = await listLeads({ status, page });
  const pageHref = (p: number) => `?${new URLSearchParams({ ...(status ? { status } : {}), page: String(p) })}`;

  return (
    <>
      <PageHeader
        title="Leads & enquiries"
        subtitle={`${data.total} total`}
        actions={
          admin.role === "owner" ? (
            <a href={`/api/admin/leads/export${status ? `?status=${status}` : ""}`} className={buttonClass("ghost", "sm")}>
              <span>Export CSV</span>
            </a>
          ) : null
        }
      />
      <nav aria-label="Filter leads" className="mb-6 flex flex-wrap gap-2 text-sm">
        {["", ...LEAD_STATUSES].map((s) => (
          <Link
            key={s || "all"}
            href={s ? `?status=${s}` : "?"}
            aria-current={status === s ? "page" : undefined}
            className={`min-h-9 rounded-full px-3.5 py-1.5 capitalize ${
              status === s ? "bg-ink text-porcelain" : "border border-rule text-graphite hover:border-ink"
            }`}
          >
            {s || "All"}
          </Link>
        ))}
      </nav>
      {data.leads.length ? (
        <ul className="rounded-[var(--radius-md)] border border-rule bg-porcelain px-5">
          {data.leads.map((l) => (
            <LeadRow key={String(l._id)} lead={l as unknown as LeadView} created={formatDateTime(l.createdAt as unknown as string)} />
          ))}
        </ul>
      ) : (
        <p className="rounded-[var(--radius-md)] border border-rule bg-porcelain p-8 text-center text-sm text-mist">No leads yet.</p>
      )}
      {data.pages > 1 ? (
        <nav aria-label="Pagination" className="mt-6 flex justify-between text-sm">
          {page > 1 ? <Link href={pageHref(page - 1)}>← Previous</Link> : <span />}
          {page < data.pages ? <Link href={pageHref(page + 1)}>Next →</Link> : <span />}
        </nav>
      ) : null}
    </>
  );
}
