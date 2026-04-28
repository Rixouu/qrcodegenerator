"use client";

import { ClipboardCopy, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DownloadFormat } from "@/components/qr-code-generator/types";

interface ActionsFooterProps {
  downloadFormat: DownloadFormat;
  canExport: boolean;
  qrError: string | null;
  onDownloadFormatChange: (value: DownloadFormat) => void;
  onDownload: () => Promise<void>;
  onCopyImage: () => Promise<void>;
  onShareImage: () => Promise<void>;
  onInvalidExport: (message: string) => void;
}

export function ActionsFooter({
  downloadFormat,
  canExport,
  qrError,
  onDownloadFormatChange,
  onDownload,
  onCopyImage,
  onShareImage,
  onInvalidExport,
}: ActionsFooterProps) {
  const formats: DownloadFormat[] = ["png", "svg", "pdf"];

  return (
    <div className="space-y-3 rounded-[1rem] bg-background/65 p-3 ring-1 ring-border/60">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Export format
          </p>
          <p className="text-xs font-semibold text-foreground">{downloadFormat.toUpperCase()}</p>
        </div>

        <div
          className="grid grid-cols-3 gap-1 rounded-xl bg-muted/70 p-1"
          aria-label="Download format"
        >
          {formats.map((format) => {
            const active = format === downloadFormat;

            return (
              <button
                key={format}
                type="button"
                title={`Use ${format.toUpperCase()} export`}
                className={
                  active
                    ? "rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                    : "rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                }
                onClick={() => onDownloadFormatChange(format)}
              >
                {format.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Button
          type="button"
          variant="default"
          disabled={!canExport}
          className="h-11 w-full justify-center gap-2 rounded-xl px-4 text-sm whitespace-nowrap"
          onClick={() => {
            if (!canExport) {
              onInvalidExport(qrError ?? "Fix the fields and try again.");
              return;
            }
            void onDownload();
          }}
        >
          <Download className="size-4" aria-hidden />
          <span>{`Download ${downloadFormat.toUpperCase()}`}</span>
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!canExport}
            className="h-11 rounded-xl px-3 text-sm hover:bg-accent/70"
            onClick={() => {
              if (!canExport) {
                onInvalidExport(qrError ?? "Fix the fields and try again.");
                return;
              }
              void onCopyImage();
            }}
          >
            <ClipboardCopy className="size-4" aria-hidden />
            <span>Copy</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={!canExport}
            className="h-11 rounded-xl px-3 text-sm hover:bg-accent/70"
            onClick={() => {
              if (!canExport) {
                onInvalidExport(qrError ?? "Fix the fields and try again.");
                return;
              }
              void onShareImage();
            }}
          >
            <Share2 className="size-4" aria-hidden />
            <span>Share</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
