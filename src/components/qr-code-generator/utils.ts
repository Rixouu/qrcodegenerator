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
  "border-input bg-background text-foreground h-10 w-full rounded-lg border pl-3 pr-10 text-sm appearance-none",
  "bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')]",
  "bg-no-repeat bg-[length:16px_16px] bg-[right_0.75rem_center]",
  "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
);
