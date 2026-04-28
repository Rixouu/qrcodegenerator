"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DecodeSectionProps {
  decodedText: string;
  decodeError: string | null;
  decodeBusy: boolean;
  onFileSelected: (file: File) => Promise<void>;
  onCopy: () => Promise<void>;
  onUse: () => void;
}

export function DecodeSection({
  decodedText,
  decodeError,
  decodeBusy,
  onFileSelected,
  onCopy,
  onUse,
}: DecodeSectionProps) {
  return (
    <div className="rounded-[1.35rem] border border-border/70 bg-card/85 p-5 shadow-[0_18px_45px_-34px_rgba(37,99,235,0.18)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Scanner
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a QR image to extract its content.
          </p>
        </div>
        {decodedText ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => void onCopy()}
            >
              Copy
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={onUse}
            >
              Use
            </Button>
          </div>
        ) : null}
      </div>
      <div className="mt-5 space-y-4">
        <Label htmlFor="decode-file" className="block text-xs">
          Decode an image
        </Label>
        <Input
          id="decode-file"
          type="file"
          accept="image/*"
          disabled={decodeBusy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            void onFileSelected(file);
            event.target.value = "";
          }}
        />
        {decodeError ? <p className="text-destructive text-sm">{decodeError}</p> : null}
        {decodedText ? (
          <div className="rounded-xl bg-background/60 p-4 ring-1 ring-border/60">
            <Label className="mb-2 block text-xs">Decoded content</Label>
            <Input value={decodedText} readOnly className="font-mono text-xs" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
