import { QrCodeGenerator } from "@/components/qr-code-generator";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="ring-offset-background relative min-h-[100dvh] min-h-screen overflow-x-hidden bg-background px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-6 sm:pb-12 lg:px-8"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 pb-8 sm:gap-6">
        <header className="flex items-start justify-between gap-4 border-b border-border/70 pb-4 sm:pb-5">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              QR Code Generator
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Generate, customize, decode, and export QR codes.
            </p>
          </div>
          <ThemeToggle className="shrink-0" />
        </header>
        <QrCodeGenerator defaultValue="https://nextjs.org" />
      </div>
    </main>
  );
}
