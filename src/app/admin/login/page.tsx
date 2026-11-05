import { LoginForm } from "@/components/admin/LoginForm";

export default function LoginPage() {
  const configured = Boolean(process.env.MONGODB_URI) && (process.env.AUTH_SECRET?.length ?? 0) >= 32;
  return (
    <main className="paper grid min-h-dvh place-items-center px-5">
      <div className="w-full max-w-sm">
        <p className="text-center font-serif text-2xl tracking-[0.18em] text-ink uppercase">
          MR <span className="text-champagne-ink">Imperial</span>
        </p>
        <div className="mt-8 rounded-[var(--radius-md)] border border-rule bg-porcelain p-7 shadow-soft">
          <h1 className="font-serif text-3xl text-ink">Sign in</h1>
          <p className="mb-6 mt-1 text-sm text-mist">Store dashboard</p>
          {configured ? (
            <LoginForm />
          ) : (
            <div className="text-sm leading-relaxed text-graphite">
              <p>The dashboard isn&rsquo;t configured yet.</p>
              <ol className="mt-3 list-decimal space-y-1 pl-5">
                <li>
                  Set <code>MONGODB_URI</code> and <code>AUTH_SECRET</code> (32+ characters) in <code>.env.local</code>.
                </li>
                <li>
                  Run <code>npm run admin:create</code> to create the owner account.
                </li>
                <li>Restart the server.</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
