import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 border-b border-rule pb-6 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-serif text-4xl leading-none text-ink">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm text-mist">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({ title, children, className = "", actions }: { title?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={`rounded-[var(--radius-md)] border border-rule bg-porcelain p-5 sm:p-6 ${className}`}>
      {title || actions ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? <h2 className="label text-mist">{title}</h2> : <span />}
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

const TONES: Record<string, string> = {
  pending: "bg-champagne-soft/50 text-champagne-ink",
  confirmed: "bg-sand text-graphite",
  processing: "bg-sand text-graphite",
  shipped: "bg-linen text-ink ring-1 ring-rule",
  delivered: "bg-success-soft text-success",
  cancelled: "bg-danger-soft text-danger",
  returned: "bg-danger-soft text-danger",
  unpaid: "bg-linen text-graphite",
  paid: "bg-success-soft text-success",
  refunded: "bg-danger-soft text-danger",
  failed: "bg-danger-soft text-danger",
  new: "bg-champagne-soft/50 text-champagne-ink",
  contacted: "bg-sand text-graphite",
  qualified: "bg-linen text-ink ring-1 ring-rule",
  converted: "bg-success-soft text-success",
  closed: "bg-linen text-mist",
  active: "bg-success-soft text-success",
  draft: "bg-linen text-graphite",
  archived: "bg-linen text-mist",
};

export function Badge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold capitalize tracking-wide ${TONES[value] ?? "bg-linen text-graphite"}`}>
      {value}
    </span>
  );
}

export const inputCls =
  "block w-full rounded-[var(--radius-sm)] border border-rule bg-ivory px-3 py-2.5 text-sm text-ink outline-none transition focus:border-ink focus:shadow-[0_0_0_3px_rgba(23,20,15,0.08)] aria-[invalid=true]:border-danger";

export function AdminField({
  label,
  error,
  hint,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-graphite">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-danger">{error}</span> : hint ? <span className="mt-1 block text-xs text-mist">{hint}</span> : null}
    </label>
  );
}
