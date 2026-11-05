import { Suspense } from "react";
import { AdminSkeleton } from "@/components/admin/AdminSkeleton";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { toProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/admin/ui";
import { getAdminProduct } from "@/lib/admin/queries";
import { requireAdminPage } from "@/lib/auth/session";

export default function ProductPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <ProductContent />
    </Suspense>
  );
}

async function ProductContent() {
  await requireAdminPage();
  const product = await getAdminProduct();
  return (
    <>
      <PageHeader title="Product" subtitle="The watch sold on the storefront. Saving refreshes the public page." />
      <ProductEditor initial={toProductForm(product)} />
    </>
  );
}
