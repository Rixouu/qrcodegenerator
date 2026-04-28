"use client";

import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { QrErrorLevel } from "@/lib/qr-history";
import { selectClassName } from "@/components/qr-code-generator/utils";

interface CustomizationSectionProps {
  fgColor: string;
  bgColor: string;
  level: QrErrorLevel;
  effectiveLevel: QrErrorLevel;
  size: number;
  logoDataUrl: string | null;
  logoScale: number;
  safeMode: boolean;
  onSyncColorsFromTheme: () => void;
  onLevelChange: (value: QrErrorLevel) => void;
  onSizeChange: (value: number) => void;
  onForegroundChange: (value: string) => void;
  onBackgroundChange: (value: string) => void;
  onLogoFileChange: (file: File | null) => void;
  onLogoRemove: () => void;
  onLogoScaleChange: (value: number) => void;
  onSafeModeChange: (value: boolean) => void;
}

export function CustomizationSection({
  fgColor,
  bgColor,
  level,
  effectiveLevel,
  size,
  logoDataUrl,
  logoScale,
  safeMode,
  onSyncColorsFromTheme,
  onLevelChange,
  onSizeChange,
  onForegroundChange,
  onBackgroundChange,
  onLogoFileChange,
  onLogoRemove,
  onLogoScaleChange,
  onSafeModeChange,
}: CustomizationSectionProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-[1.35rem] border border-border/70 bg-card/85 p-5 shadow-[0_18px_45px_-34px_rgba(37,99,235,0.18)]">
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Basics
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tune scan reliability and output size before styling.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="qr-level">Error correction</Label>
            <select
              id="qr-level"
              aria-label="Error correction"
              value={effectiveLevel}
              onChange={(event) => onLevelChange(event.target.value as QrErrorLevel)}
              disabled={!!logoDataUrl && safeMode}
              className={selectClassName}
            >
              <option value="L">Low (~7%)</option>
              <option value="M">Medium (~15%)</option>
              <option value="Q">Quartile (~25%)</option>
              <option value="H">High (~30%)</option>
            </select>
            {logoDataUrl && safeMode ? (
              <p className="text-muted-foreground text-xs">
                Locked to High while Safe mode is enabled.
              </p>
            ) : null}
            {!logoDataUrl && level !== effectiveLevel ? (
              <p className="text-muted-foreground text-xs">
                Error correction is adjusted automatically when needed.
              </p>
            ) : null}
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
              onChange={(event) => {
                const next = Number(event.target.value);
                if (Number.isFinite(next)) {
                  onSizeChange(Math.min(400, Math.max(128, next)));
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-[1.35rem] border border-border/70 bg-card/85 p-5 shadow-[0_18px_45px_-34px_rgba(37,99,235,0.18)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Palette
            </p>
            <span className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs font-medium">
            <Palette className="size-3.5 shrink-0" aria-hidden />
            Colors
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={onSyncColorsFromTheme}
          >
            Sync with theme
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="fg-color">Foreground</Label>
            <div className="flex items-center gap-2">
              <Input
                id="fg-color"
                type="color"
                value={fgColor}
                onChange={(event) => onForegroundChange(event.target.value)}
                className="h-10 w-10 shrink-0 cursor-pointer p-1"
                aria-label="Pick foreground color"
              />
              <Input
                value={fgColor}
                onChange={(event) => onForegroundChange(event.target.value)}
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
                onChange={(event) => onBackgroundChange(event.target.value)}
                className="h-10 w-10 shrink-0 cursor-pointer p-1"
                aria-label="Pick background color"
              />
              <Input
                value={bgColor}
                onChange={(event) => onBackgroundChange(event.target.value)}
                maxLength={7}
                className="min-w-0 flex-1"
                aria-label="Background hex color"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.35rem] border border-border/70 bg-card/85 p-5 shadow-[0_18px_45px_-34px_rgba(37,99,235,0.18)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Brand
            </p>
            <span className="text-muted-foreground mt-1 text-xs font-medium">Logo</span>
          </div>
          {logoDataUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={onLogoRemove}
            >
              Remove
            </Button>
          ) : null}
        </div>
        <Label htmlFor="logo-file" className="text-xs">
          Logo image
        </Label>
        <Input
          id="logo-file"
          type="file"
          accept="image/*"
          className="mt-2"
          onChange={(event) => onLogoFileChange(event.target.files?.[0] ?? null)}
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="logo-scale">Logo size (%)</Label>
            <Input
              id="logo-scale"
              type="number"
              min={10}
              max={35}
              step={1}
              value={Math.round(logoScale * 100)}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (Number.isFinite(next)) {
                  onLogoScaleChange(Math.min(0.35, Math.max(0.1, next / 100)));
                }
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="safe-mode">Safe mode</Label>
            <label className="text-foreground flex min-h-10 select-none items-center gap-2 rounded-lg border border-border px-3 text-sm">
              <input
                id="safe-mode"
                type="checkbox"
                checked={safeMode}
                onChange={(event) => onSafeModeChange(event.target.checked)}
                className="accent-foreground size-4"
              />
              Force high error correction
            </label>
          </div>
        </div>
        {logoDataUrl && safeMode ? (
          <p className="text-muted-foreground mt-3 text-xs">
            Safe mode forces error correction to High and increases padding for better scan reliability.
          </p>
        ) : null}
      </div>
    </div>
  );
}
