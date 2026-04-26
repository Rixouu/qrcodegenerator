"use client";

import { useTheme } from "next-themes";
import { useCallback, useLayoutEffect, useState } from "react";
import { readThemeQrHexFromDocument } from "@/lib/qr-png";

interface UseThemeQrColorsResult {
  colorsLocked: boolean;
  setColorsLocked: (locked: boolean) => void;
  syncColorsFromTheme: () => void;
  markColorsCustom: () => void;
}

/**
 * Keeps QR foreground/background in sync with design tokens until the user edits colors.
 */
export function useThemeQrColors(
  setFgColor: (v: string) => void,
  setBgColor: (v: string) => void,
): UseThemeQrColorsResult {
  const { resolvedTheme } = useTheme();
  const [colorsLocked, setColorsLocked] = useState(false);

  const applyProbe = useCallback(() => {
    const { fg, bg } = readThemeQrHexFromDocument();
    setFgColor(fg);
    setBgColor(bg);
  }, [setFgColor, setBgColor]);

  useLayoutEffect(() => {
    if (colorsLocked) return;
    if (typeof window === "undefined") return;
    if (!resolvedTheme) return;
    applyProbe();
  }, [resolvedTheme, colorsLocked, applyProbe]);

  const syncColorsFromTheme = useCallback(() => {
    setColorsLocked(false);
    applyProbe();
  }, [applyProbe]);

  const markColorsCustom = useCallback(() => {
    setColorsLocked(true);
  }, []);

  return {
    colorsLocked,
    setColorsLocked,
    syncColorsFromTheme,
    markColorsCustom,
  };
}
