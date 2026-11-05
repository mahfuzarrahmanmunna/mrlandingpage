export function AdminSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" className="grid gap-4">
      <div className="skeleton h-10 w-56 rounded" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="skeleton h-28 rounded" />
        <div className="skeleton h-28 rounded" />
        <div className="skeleton h-28 rounded" />
      </div>
      <div className="skeleton h-72 rounded" />
    </div>
  );
}
