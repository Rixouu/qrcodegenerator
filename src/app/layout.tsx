import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppToaster } from "@/components/app-toaster";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { ThemeColorMeta } from "@/components/theme-color-meta";
import { ThemeProvider } from "@/components/theme-provider";
import { appleStartupImages } from "@/lib/pwa-apple-startup";
import { getSiteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

const title = "QR Code Generator";
const description =
  "Generate QR codes for any URL or text. Live preview, error correction, copy, share, download PNG, and local history — PWA ready.";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: title,
    template: `%s · ${title}`,
  },
  description,
  applicationName: title,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: title,
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  appleWebApp: {
    capable: true,
    title,
    statusBarStyle: "black-translucent",
    startupImage: appleStartupImages,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
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
    { media: "(prefers-color-scheme: dark)", color: "#090E16" },
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
          <a
            href="#main-content"
            className={cn(
              "skip-link bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium shadow-md",
              "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            )}
          >
            Skip to content
          </a>
          <ThemeColorMeta />
          {children}
          <PwaInstallBanner />
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
