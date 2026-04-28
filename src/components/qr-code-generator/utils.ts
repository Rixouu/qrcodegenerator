"use client";

import { cn } from "@/lib/utils";

export function truncateLabel(value: string, max = 96): string {
  const t = value.trim() || "empty";
  if (t.length <= max) return t;
  return `${t.slice(0, max)}...`;
}

export function escapeWifiValue(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll(":", "\\:");
}

export function escapeVCardValue(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,");
}

export const selectClassName = cn(
  "border-input bg-background text-foreground h-10 w-full rounded-lg border px-3 text-sm",
  "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
);
