import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { PwaInstallBanner } from "@/components/pwa-install-banner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QR Code Generator",
  description:
    "Generate QR codes for any URL or text and download them as PNG images.",
  applicationName: "QR Code Generator",
  appleWebApp: {
    capable: true,
    title: "QR Code Generator",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [{ url: "/icon-qr-code.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon-qr-code.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <PwaInstallBanner />
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
