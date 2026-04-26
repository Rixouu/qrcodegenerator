import { QrCodeGenerator } from "@/components/qr-code-generator";

export default function Home() {
  return (
    <main className="flex min-h-[100dvh] min-h-screen flex-col items-center justify-between px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] md:p-24">
      <div className="flex flex-col items-center justify-center w-full max-w-3xl space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center">QR Code Generator</h1>
        <p className="text-center text-muted-foreground">
          Enter any URL or text to generate a QR code. Download your QR code as a PNG image.
        </p>
        <QrCodeGenerator defaultValue="https://nextjs.org" />
      </div>
    </main>
  );
}
