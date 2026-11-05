"use client";

import { Button } from "@/components/ui/Button";

export function SaveBar({
  saving,
  message,
  label = "Save changes",
}: {
  saving: boolean;
  message: { tone: "ok" | "error"; text: string } | null;
  label?: string;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-5 mt-8 flex flex-wrap items-center justify-end gap-4 border-t border-rule bg-ivory/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
      {message ? (
        <p role={message.tone === "error" ? "alert" : "status"} className={`text-sm ${message.tone === "error" ? "text-danger" : "text-success"}`}>
          {message.text}
        </p>
      ) : null}
      <Button type="submit" loading={saving} loadingLabel="Saving…">
        {label}
      </Button>
    </div>
  );
}
