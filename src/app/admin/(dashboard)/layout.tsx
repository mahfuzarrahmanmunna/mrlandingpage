import { AdminShell } from "@/components/admin/AdminShell";

/**
 * Static shell only. Each page authorises itself on the server (inside its own
 * Suspense boundary) via requireAdminPage(); proxy.ts is only an early redirect.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
