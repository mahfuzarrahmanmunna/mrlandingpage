"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Shared save/request helper for admin editors: field errors, status, refresh. */
export function useAdminRequest() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  async function send(url: string, method: "PUT" | "PATCH" | "POST", body: unknown, okText = "Saved.") {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 401) {
        router.replace("/admin/login");
        return null;
      }
      if (!res.ok) {
        setErrors(data?.fields ?? {});
        setMessage({ tone: "error", text: data?.error ?? "Could not save." });
        return null;
      }
      setErrors({});
      setMessage({ tone: "ok", text: okText });
      router.refresh();
      return data;
    } catch {
      setMessage({ tone: "error", text: "Network error. Please retry." });
      return null;
    } finally {
      setSaving(false);
    }
  }

  return { send, saving, errors, message, setMessage };
}
