import { withAdmin } from "@/lib/auth/guard";
import { connectDB } from "@/lib/db";
import { LEAD_STATUSES, Lead, type LeadStatus } from "@/lib/models/Lead";

/** Neutralise spreadsheet formula injection and quote every cell. */
function cell(v: unknown) {
  let s = v instanceof Date ? v.toISOString() : String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/** Owner-only CSV export of leads (controlled: auth + owner role + max 5000 rows). */
export const GET = withAdmin(
  async (req) => {
    const url = new URL(req.url);
    const raw = url.searchParams.get("status");
    const status = LEAD_STATUSES.includes(raw as LeadStatus) ? (raw as LeadStatus) : null;
    await connectDB();
    const leads = await Lead.find(status ? { status } : {})
      .sort({ createdAt: -1 })
      .limit(5000)
      .lean();
    const header = [
      "created_at", "name", "phone", "email", "source", "status", "interest", "message",
      "follow_up_at", "follow_up_note", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "referrer",
    ];
    const rows = leads.map((l) =>
      [
        l.createdAt, l.name, l.phone, l.email, l.source, l.status, l.interest, l.message,
        l.followUpAt, l.followUpNote, l.attribution?.utm_source, l.attribution?.utm_medium,
        l.attribution?.utm_campaign, l.attribution?.utm_content, l.attribution?.utm_term, l.attribution?.referrer,
      ].map(cell).join(","),
    );
    const csv = "﻿" + [header.join(","), ...rows].join("\r\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="mr-imperial-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  },
  { ownerOnly: true },
);
