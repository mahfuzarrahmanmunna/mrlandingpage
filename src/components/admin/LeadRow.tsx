"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge, inputCls } from "./ui";
import { useAdminRequest } from "./useAdminSave";

const STATUSES = ["new", "contacted", "qualified", "converted", "closed"];

export type LeadView = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  interest?: string;
  source: string;
  status: string;
  followUpAt?: string;
  followUpNote?: string;
  createdAt: string;
  attribution?: Record<string, string | undefined>;
};

export function LeadRow({ lead, created }: { lead: LeadView; created: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(lead.status);
  const [followUpAt, setFollowUpAt] = useState(lead.followUpAt ? lead.followUpAt.slice(0, 10) : "");
  const [followUpNote, setFollowUpNote] = useState(lead.followUpNote ?? "");
  const { send, saving, message } = useAdminRequest();
  const utm = lead.attribution ?? {};
  const source = [utm.utm_source, utm.utm_medium, utm.utm_campaign].filter(Boolean).join(" / ");

  return (
    <li className="border-b border-rule-soft py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-ink">
            {lead.name} <span className="font-normal text-mist">· {created}</span>
          </p>
          <p className="text-sm">
            <a href={`tel:${lead.phone}`} className="text-graphite underline-offset-4 hover:underline">
              {lead.phone}
            </a>
            {lead.email ? <span className="text-mist"> · {lead.email}</span> : null}
          </p>
          {lead.interest ? <p className="mt-1 text-xs text-mist">Interest: {lead.interest}</p> : null}
          {lead.message ? <p className="mt-2 max-w-2xl text-sm text-graphite">{lead.message}</p> : null}
          <p className="mt-1 text-xs text-mist">
            {lead.source === "order" ? "From an order" : "Enquiry"}
            {source ? ` · ${source}` : utm.referrer ? ` · ${utm.referrer}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge value={lead.status} />
          <button type="button" onClick={() => setOpen((o) => !o)} className="min-h-9 text-sm text-graphite underline-offset-4 hover:underline" aria-expanded={open}>
            {open ? "Close" : "Follow up"}
          </button>
        </div>
      </div>
      {open ? (
        <form
          className="mt-4 grid gap-3 rounded-[var(--radius-sm)] bg-ivory p-4 sm:grid-cols-[160px_180px_1fr_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            void send(`/api/admin/leads/${lead._id}`, "PATCH", { status, followUpAt, followUpNote }, "Lead updated.");
          }}
        >
          <label className="text-xs text-graphite">
            Status
            <select className={`${inputCls} mt-1`} value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-graphite">
            Follow-up date
            <input type="date" className={`${inputCls} mt-1`} value={followUpAt} onChange={(e) => setFollowUpAt(e.target.value)} />
          </label>
          <label className="text-xs text-graphite">
            Note
            <input className={`${inputCls} mt-1`} value={followUpNote} onChange={(e) => setFollowUpNote(e.target.value)} maxLength={1000} />
          </label>
          <Button type="submit" size="sm" loading={saving}>
            Save
          </Button>
          {message ? <p className={`text-xs sm:col-span-4 ${message.tone === "error" ? "text-danger" : "text-success"}`}>{message.text}</p> : null}
        </form>
      ) : null}
    </li>
  );
}
