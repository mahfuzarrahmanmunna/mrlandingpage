import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Manrope } from "next/font/google";
import { FloatingContactButtons } from "@/components/ui/FloatingContactButtons";
import "./globals.css";

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Bengali copy: Hind Siliguri is the familiar, highly legible Bangla face for BD readers.
const bengali = Hind_Siliguri({
  variable: "--font-bengali",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mrimperial-eight.vercel.app"),
  title: { default: "MR Imperial", template: "%s" },
  applicationName: "MR Imperial",
  creator: "MR Imperial",
  publisher: "MR Imperial",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${body.variable} ${bengali.variable} antialiased`}>
      <body className="min-h-dvh bg-ivory text-ink">
        {children}
        <FloatingContactButtons />
      </body>
    </html>
  );
}
