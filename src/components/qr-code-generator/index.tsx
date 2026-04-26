"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import QRCode from "react-qr-code";
import {
  Share2,
  ClipboardCopy,
  Download,
  History,
  Palette,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useThemeQrColors } from "@/hooks/use-theme-qr-colors";
import {
  loadQrHistory,
  pushQrHistory,
  persistQrHistory,
  type QrErrorLevel,
  type QrHistoryEntry,
} from "@/lib/qr-history";
import { qrSvgToPngBlob } from "@/lib/qr-png";
import { cn } from "@/lib/utils";

interface QrCodeGeneratorProps {
  defaultValue?: string;
}

function truncateLabel(value: string, max = 96): string {
  const t = value.trim() || "empty";
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export function QrCodeGenerator({ defaultValue = "https://example.com" }: QrCodeGeneratorProps) {
  const [qrValue, setQrValue] = useState(defaultValue);
  const [fgColor, setFgColor] = useState("#171717");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [level, setLevel] = useState<QrErrorLevel>("M");
  const [size, setSize] = useState(200);
  const [history, setHistory] = useState<QrHistoryEntry[]>([]);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const { syncColorsFromTheme, markColorsCustom } = useThemeQrColors(
    setFgColor,
    setBgColor,
  );

  useEffect(() => {
    startTransition(() => {
      setHistory(loadQrHistory());
    });
  }, []);

  const previewLabel = useMemo(
    () => `QR code encoding: ${truncateLabel(qrValue)}`,
    [qrValue],
  );

  const getSvg = useCallback((): SVGElement | null => {
    return qrCodeRef.current?.querySelector("svg") ?? null;
  }, []);

  const recordHistory = useCallback(() => {
    pushQrHistory({
      value: qrValue,
      fgColor,
      bgColor,
      level,
      size,
    });
    setHistory(loadQrHistory());
  }, [qrValue, fgColor, bgColor, level, size]);

  const buildPngBlob = useCallback(async () => {
    const svg = getSvg();
    if (!svg) throw new Error("SVG not found");
    return qrSvgToPngBlob(svg, bgColor);
  }, [getSvg, bgColor]);

  const downloadQrCode = useCallback(async () => {
    try {
      const blob = await buildPngBlob();
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `qrcode-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
      recordHistory();
      toast.success("QR code downloaded", {
        description: "PNG saved to your device.",
      });
    } catch {
      toast.error("Download failed", {
        description: "Could not create the PNG. Try again.",
      });
    }
  }, [buildPngBlob, recordHistory]);

  const copyImage = useCallback(async () => {
    try {
      const blob = await buildPngBlob();
      if (!navigator.clipboard || !window.ClipboardItem) {
        toast.error("Copy not supported", {
          description: "Your browser does not allow copying images.",
        });
        return;
      }
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      recordHistory();
      toast.success("Image copied", {
        description: "Paste it into any app that accepts images.",
      });
    } catch {
      toast.error("Copy failed", {
        description: "Permission may be denied or the image is too large.",
      });
    }
  }, [buildPngBlob, recordHistory]);

  const shareImage = useCallback(async () => {
    try {
      const blob = await buildPngBlob();
      const file = new File([blob], "qrcode.png", { type: "image/png" });
      if (!navigator.share) {
        toast.message("Share unavailable", {
          description: "Use Download or Copy on this device.",
        });
        return;
      }
      const payload = { files: [file], title: "QR code" };
      if (!navigator.canShare?.(payload)) {
        toast.message("Sharing files unsupported", {
          description: "Try Copy or Download instead.",
        });
        return;
      }
      await navigator.share(payload);
      recordHistory();
      toast.success("Shared");
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      toast.error("Share failed", {
        description: "Try Download or Copy instead.",
      });
    }
  }, [buildPngBlob, recordHistory]);

  const restoreEntry = useCallback((e: QrHistoryEntry) => {
    setQrValue(e.value);
    setFgColor(e.fgColor);
    setBgColor(e.bgColor);
    setLevel(e.level);
    setSize(e.size);
    markColorsCustom();
    toast.message("Restored from history");
  }, [markColorsCustom]);

  const clearHistory = useCallback(() => {
    persistQrHistory([]);
    setHistory([]);
    toast.message("History cleared");
  }, []);

  const handleFgColorChange = useCallback(
    (next: string) => {
      markColorsCustom();
      setFgColor(next);
    },
    [markColorsCustom],
  );

  const handleBgColorChange = useCallback(
    (next: string) => {
      markColorsCustom();
      setBgColor(next);
    },
    [markColorsCustom],
  );

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <h2 className="text-center text-lg leading-none font-semibold tracking-tight">
          Your QR code
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="qr-input">URL or text</Label>
          <Input
            id="qr-input"
            value={qrValue}
            onChange={(ev) => setQrValue(ev.target.value || defaultValue)}
            placeholder="Enter URL or text"
            className="w-full"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="qr-level">Error correction</Label>
            <select
              id="qr-level"
              value={level}
              onChange={(ev) => setLevel(ev.target.value as QrErrorLevel)}
              className={cn(
                "border-input bg-background text-foreground h-9 w-full rounded-md border px-2 text-sm shadow-xs",
                "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
              )}
            >
              <option value="L">Low (~7%)</option>
              <option value="M">Medium (~15%)</option>
              <option value="Q">Quartile (~25%)</option>
              <option value="H">High (~30%)</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="qr-size">Size (px)</Label>
            <Input
              id="qr-size"
              type="number"
              min={128}
              max={400}
              step={8}
              value={size}
              onChange={(ev) => {
                const n = Number(ev.target.value);
                if (Number.isFinite(n)) setSize(Math.min(400, Math.max(128, n)));
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <Palette className="size-3.5 shrink-0" aria-hidden />
            Colors
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={syncColorsFromTheme}
          >
            Sync with theme
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="fg-color">Foreground</Label>
            <div className="flex items-center gap-2">
              <Input
                id="fg-color"
                type="color"
                value={fgColor}
                onChange={(e) => handleFgColorChange(e.target.value)}
                className="h-10 w-10 shrink-0 cursor-pointer p-1"
                aria-label="Pick foreground color"
              />
              <Input
                value={fgColor}
                onChange={(e) => handleFgColorChange(e.target.value)}
                maxLength={7}
                className="min-w-0 flex-1"
                aria-label="Foreground hex color"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="bg-color">Background</Label>
            <div className="flex items-center gap-2">
              <Input
                id="bg-color"
                type="color"
                value={bgColor}
                onChange={(e) => handleBgColorChange(e.target.value)}
                className="h-10 w-10 shrink-0 cursor-pointer p-1"
                aria-label="Pick background color"
              />
              <Input
                value={bgColor}
                onChange={(e) => handleBgColorChange(e.target.value)}
                maxLength={7}
                className="min-w-0 flex-1"
                aria-label="Background hex color"
              />
            </div>
          </div>
        </div>

        <div
          ref={qrCodeRef}
          className="flex items-center justify-center rounded-md border border-border p-4"
          style={{ backgroundColor: bgColor }}
        >
          <div
            role="img"
            aria-label={previewLabel}
            className="inline-flex max-w-full overflow-auto"
          >
            <QRCode
              value={qrValue}
              size={size}
              bgColor={bgColor}
              fgColor={fgColor}
              level={level}
            />
          </div>
        </div>

        {history.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                <History className="size-3.5 shrink-0" aria-hidden />
                Recent
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={clearHistory}
              >
                Clear
              </Button>
            </div>
            <ul
              className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border bg-muted/30 p-1 text-sm"
              aria-label="Recent QR payloads"
            >
              {history.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    className="hover:bg-accent focus-visible:ring-ring/50 w-full rounded px-2 py-1.5 text-left focus-visible:ring-[3px] focus-visible:outline-none"
                    onClick={() => restoreEntry(entry)}
                  >
                    <span className="text-foreground line-clamp-2 block font-medium">
                      {truncateLabel(entry.value, 64)}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {entry.level} · {entry.size}px
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
          <Button type="button" variant="default" onClick={downloadQrCode}>
            <Download className="size-4" aria-hidden />
            Download
          </Button>
          <Button type="button" variant="secondary" onClick={copyImage}>
            <ClipboardCopy className="size-4" aria-hidden />
            Copy image
          </Button>
          <Button type="button" variant="secondary" onClick={shareImage}>
            <Share2 className="size-4" aria-hidden />
            Share
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
