import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MR Imperial — Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  // The public site is Bangla (<html lang="bn">); the admin panel stays English.
  return (
    <div lang="en" className="contents">
      {children}
    </div>
  );
}
