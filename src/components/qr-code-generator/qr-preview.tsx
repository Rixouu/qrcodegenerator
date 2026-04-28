"use client";

import Image from "next/image";
import QRCode from "react-qr-code";

interface QrPreviewProps {
  qrCodeRef: React.RefObject<HTMLDivElement | null>;
  qrValue: string;
  previewLabel: string;
  bgColor: string;
  fgColor: string;
  size: number;
  effectiveLevel: "L" | "M" | "Q" | "H";
  logoDataUrl: string | null;
  logoScale: number;
  safeMode: boolean;
}

export function QrPreview({
  qrCodeRef,
  qrValue,
  previewLabel,
  bgColor,
  fgColor,
  size,
  effectiveLevel,
  logoDataUrl,
  logoScale,
  safeMode,
}: QrPreviewProps) {
  const overlaySize = Math.max(1, Math.round(size * logoScale));

  return (
    <div
      ref={qrCodeRef}
      className="flex items-center justify-center rounded-[1rem] ring-1 ring-border/60"
      style={{
        backgroundColor: bgColor,
        padding: logoDataUrl && safeMode ? Math.max(16, Math.round(size * 0.12)) : 16,
      }}
    >
      <div
        role="img"
        aria-label={previewLabel}
        className="relative inline-flex max-w-full overflow-auto"
      >
        <QRCode
          value={qrValue || " "}
          size={size}
          bgColor={bgColor}
          fgColor={fgColor}
          level={effectiveLevel}
        />
        {logoDataUrl ? (
          <Image
            src={logoDataUrl}
            alt=""
            aria-hidden
            unoptimized
            width={overlaySize}
            height={overlaySize}
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain"
          />
        ) : null}
      </div>
    </div>
  );
}
