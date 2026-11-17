import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Hind_Siliguri, Manrope } from "next/font/google";
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

// Refined serif, used only for the wordmark and a few Latin display accents.
const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mrimperial-eight.vercel.app"),
  title: { default: "এমআর ইম্পেরিয়াল", template: "%s" },
  applicationName: "এমআর ইম্পেরিয়াল",
  creator: "এমআর ইম্পেরিয়াল",
  publisher: "এমআর ইম্পেরিয়াল",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#fbfaf7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" data-scroll-behavior="smooth" className={`${body.variable} ${bengali.variable} ${display.variable} antialiased`}>
      <body className="min-h-dvh bg-ivory text-ink">
        {children}
        <FloatingContactButtons />
      </body>
    </html>
  );
}
