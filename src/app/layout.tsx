import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppToaster } from "@/components/app-toaster";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { ThemeProvider } from "@/components/theme-provider";
import { appleStartupImages } from "@/lib/pwa-apple-startup";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QR Code Generator",
  description:
    "Generate QR codes for any URL or text and download them as PNG images.",
  applicationName: "QR Code Generator",
  appleWebApp: {
    capable: true,
    title: "QR Code Generator",
    statusBarStyle: "black-translucent",
    startupImage: appleStartupImages,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon-qr-code.svg", type: "image/svg+xml" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "dark light",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-[100dvh] touch-manipulation antialiased`}
      >
        <ThemeProvider>
          {children}
          <PwaInstallBanner />
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
