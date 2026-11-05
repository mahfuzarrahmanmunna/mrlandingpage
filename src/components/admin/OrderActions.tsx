"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AdminField, Card, inputCls } from "./ui";
import { useAdminRequest } from "./useAdminSave";

export function OrderActions({
  orderId,
  status,
  transitions,
  paymentMethod,
  paymentStatus,
}: {
  orderId: string;
  status: string;
  transitions: string[];
  paymentMethod: string;
  paymentStatus: string;
}) {
  const { send, saving, message } = useAdminRequest();
  const [next, setNext] = useState(transitions[0] ?? "");
  const [statusNote, setStatusNote] = useState("");
  const [note, setNote] = useState("");
  const url = `/api/admin/orders/${orderId}`;

  return (
    <div className="grid gap-6">
      <Card title="Update status">
        {transitions.length ? (
          <form
            className="grid gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const confirmMsg =
                next === "cancelled" || next === "returned"
                  ? `Mark this order as ${next}? Reserved stock will be returned to inventory.`
                  : null;
              if (confirmMsg && !window.confirm(confirmMsg)) return;
              const ok = await send(url, "PATCH", { status: next, statusNote }, `Status changed to ${next}.`);
              if (ok) setStatusNote("");
            }}
          >
            <p className="text-sm text-graphite">
              Current: <strong className="capitalize">{status}</strong>
            </p>
            <AdminField label="New status">
              <select className={inputCls} value={next} onChange={(e) => setNext(e.target.value)}>
                {transitions.map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Note (optional, saved in history)">
              <input className={inputCls} value={statusNote} onChange={(e) => setStatusNote(e.target.value)} maxLength={500} />
            </AdminField>
            <Button type="submit" size="sm" loading={saving}>
              Update status
            </Button>
          </form>
        ) : (
          <p className="text-sm text-mist">This order is {status}; no further status changes are possible.</p>
        )}
      </Card>

      {paymentMethod === "cod" ? (
        <Card title="Cash collection">
          <div className="flex flex-wrap gap-2">
            {(["unpaid", "paid", "refunded"] as const).map((p) => (
              <Button
                key={p}
                type="button"
                size="sm"
                variant={p === paymentStatus ? "primary" : "ghost"}
                disabled={saving || p === paymentStatus}
                onClick={() => send(url, "PATCH", { paymentStatus: p }, `Payment marked ${p}.`)}
                className="capitalize"
              >
                {p}
              </Button>
            ))}
          </div>
          <p className="mt-3 text-xs text-mist">Mark as paid only after the courier has remitted the cash.</p>
        </Card>
      ) : null}

      <Card title="Internal note">
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!note.trim()) return;
            const ok = await send(url, "PATCH", { internalNote: note }, "Note added.");
            if (ok) setNote("");
          }}
        >
          <textarea rows={3} className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} aria-label="Internal note" />
          <Button type="submit" size="sm" variant="secondary" loading={saving}>
            Add note
          </Button>
        </form>
      </Card>

      {message ? (
        <p role={message.tone === "error" ? "alert" : "status"} className={`text-sm ${message.tone === "error" ? "text-danger" : "text-success"}`}>
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
