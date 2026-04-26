import { QrCodeGenerator } from "@/components/qr-code-generator";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="ring-offset-background relative flex min-h-[100dvh] min-h-screen flex-col items-center justify-between px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(3.5rem,env(safe-area-inset-top))] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:p-24 md:pt-24"
    >
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-end px-4 pt-[max(0.75rem,env(safe-area-inset-top))] md:absolute md:px-8 md:pt-8">
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </div>
      <div className="flex w-full max-w-3xl flex-col items-center justify-center space-y-8">
        <h1 className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          QR Code Generator
        </h1>
        <p className="text-center text-muted-foreground">
          Enter any URL or text to generate a QR code. Download your QR code as a PNG image.
        </p>
        <QrCodeGenerator defaultValue="https://nextjs.org" />
      </div>
    </main>
  );
}
