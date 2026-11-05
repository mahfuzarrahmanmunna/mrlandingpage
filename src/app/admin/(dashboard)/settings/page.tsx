import { Suspense } from "react";
import { AdminSkeleton } from "@/components/admin/AdminSkeleton";
import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { toSettingsForm } from "@/components/admin/settings-form";
import { PageHeader } from "@/components/admin/ui";
import { getAdminSettings } from "@/lib/admin/queries";
import { requireAdminPage } from "@/lib/auth/session";

export default function SettingsPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}

async function SettingsContent() {
  const admin = await requireAdminPage();
  const settings = await getAdminSettings();
  return (
    <>
      <PageHeader title="Store settings" subtitle="Contact, delivery, payment, trust content and policies." />
      {admin.role !== "owner" ? <p className="mb-4 text-sm text-danger">Only the owner can save settings.</p> : null}
      <SettingsEditor initial={toSettingsForm(settings)} />
    </>
  );
}
