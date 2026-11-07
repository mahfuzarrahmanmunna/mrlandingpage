"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { captureAttribution } from "@/lib/attribution";
import { trackEvent } from "@/lib/analytics";
import { fieldErrors, leadRequestSchema } from "@/lib/validation/order";
import { TextArea, TextField } from "./Field";
import { useStorefront } from "./StorefrontProvider";

export function EnquiryForm() {
  const { product, variant } = useStorefront();
  const [values, setValues] = useState({ name: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const readyAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    readyAt.current = Date.now();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const payload = {
      ...values,
      interest: `${product.title} — ${variant.name}`,
      attribution: captureAttribution(),
      company: (formRef.current?.elements.namedItem("company") as HTMLInputElement | null)?.value ?? "",
      elapsedMs: Date.now() - readyAt.current,
    };
    const parsed = leadRequestSchema.safeParse(payload);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      formRef.current?.querySelector<HTMLElement>(`[name='${Object.keys(errs)[0]}']`)?.focus();
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        trackEvent("generate_lead", { lead_type: "callback_request", item_name: product.title });
        setState("sent");
        return;
      }
      if (data?.fields) setErrors(data.fields);
      setMessage(data?.error ?? "Could not send your enquiry.");
      setState("error");
    } catch {
      setMessage("Network error — please try again.");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div role="status" className="flex items-start gap-3 rounded-[var(--radius-sm)] border border-rule bg-porcelain p-5">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-success-soft text-success">
          <Icon name="check" size={18} />
        </span>
        <div>
          <p className="font-semibold text-ink">Thank you — we&rsquo;ll be in touch.</p>
          <p className="mt-1 text-sm text-graphite">Our team will call you back on the number you provided.</p>
        </div>
      </div>
    );
  }

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((s) => ({ ...s, [k]: e.target.value }));
    if (errors[k]) setErrors(({ [k]: _r, ...rest }) => rest);
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Name" name="name" autoComplete="name" value={values.name} onChange={set("name")} error={errors.name} maxLength={80} />
        <TextField
          label="Mobile number"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="01XXXXXXXXX"
          value={values.phone}
          onChange={set("phone")}
          error={errors.phone}
          maxLength={20}
        />
      </div>
      <TextArea
        label="Your question"
        name="message"
        optional
        rows={3}
        value={values.message}
        onChange={set("message")}
        error={errors.message}
        maxLength={800}
      />
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <input type="text" name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      {state === "error" ? (
        <p role="alert" className="text-sm text-danger">
          {message}
        </p>
      ) : null}
      <Button type="submit" variant="secondary" loading={state === "sending"} loadingLabel="Sending…">
        Request a call back
      </Button>
    </form>
  );
}
